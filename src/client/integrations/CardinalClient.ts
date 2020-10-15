import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { IInitializationData } from '../../shared/integrations/cardinal-commerce/IInitializationData';
import { CardinalProvider } from '../../application/core/integrations/cardinal-commerce/CardinalProvider';
import { first, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ICardinal } from './ICardinal';
import { defer, Observable } from 'rxjs';
import { PaymentEvents } from '../../application/core/models/constants/PaymentEvents';
import { IContinueData } from '../../shared/integrations/cardinal-commerce/IContinueData';
import { IConfig } from '../../shared/model/config/IConfig';
import { PaymentBrand } from '../../application/core/models/constants/PaymentBrand';
import { ITriggerData } from '../../shared/integrations/cardinal-commerce/ITriggerData';
import { IValidationResult } from '../../shared/integrations/cardinal-commerce/IValidationResult';
import { environment } from '../../environments/environment';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { IOnCardinalValidated } from '../../application/core/models/IOnCardinalValidated';

@Service()
export class CardinalClient {
  private static readonly CARDINAL_VALIDATION_ERROR = 4000;
  private cardinal$: Observable<ICardinal>;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private cardinalProvider: CardinalProvider,
    private configProvider: ConfigProvider
  ) {
    this.cardinal$ = defer(() =>
      this.configProvider.getConfig$().pipe(
        switchMap((config: IConfig) => this.cardinalProvider.getCardinal$(Boolean(config.livestatus))),
        shareReplay(1)
      )
    );
  }

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_SETUP)
      .thenRespond((event: IMessageBusEvent<IInitializationData>) => this.cardinalSetup(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_CONTINUE)
      .thenRespond((event: IMessageBusEvent<IContinueData>) => this.cardinalContinue(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_TRIGGER)
      .thenRespond((event: IMessageBusEvent<ITriggerData<any>>) => this.cardinalTrigger(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_START)
      .thenRespond((event: IMessageBusEvent<IInitializationData>) => this.cardinalStart(event.data));
  }

  private cardinalSetup(data: IInitializationData): Observable<void> {
    return this.cardinal$.pipe(
      switchMap(
        (cardinal: ICardinal) =>
          new Observable<void>(subscriber => {
            cardinal.on(PaymentEvents.SETUP_COMPLETE, () => {
              subscriber.next(void 0);
              subscriber.complete();
              cardinal.off(PaymentEvents.SETUP_COMPLETE);
            });
            cardinal.configure(environment.CARDINAL_COMMERCE.CONFIG);
            cardinal.setup(PaymentEvents.INIT, {
              jwt: data.jwt
            });
          })
      )
    );
  }

  private cardinalContinue(data: IContinueData): Observable<IValidationResult> {
    return this.cardinal$.pipe(
      switchMap(
        (cardinal: ICardinal) =>
          new Observable<IValidationResult>(subscriber => {
            cardinal.on(PaymentEvents.VALIDATED, (result: IValidationResult, responseJwt: string) => {
              if (result.ErrorNumber !== CardinalClient.CARDINAL_VALIDATION_ERROR) {
                subscriber.next({ ...result, jwt: responseJwt });
                subscriber.complete();
                cardinal.off(PaymentEvents.VALIDATED);
              }
            });

            const { acsUrl, payload, transactionId, jwt } = data;

            cardinal.continue(
              PaymentBrand,
              {
                AcsUrl: acsUrl,
                Payload: payload
              },
              {
                Cart: [],
                OrderDetails: {
                  TransactionId: transactionId
                }
              },
              jwt
            );
          })
      )
    );
  }

  private cardinalTrigger<T>(triggerData: ITriggerData<T>): Observable<void> {
    const { eventName, data } = triggerData;

    return this.cardinal$.pipe(
      first(),
      tap(cardinal => cardinal.trigger(eventName, data)),
      mapTo(void 0)
    );
  }

  private cardinalStart(data: IInitializationData): Observable<void> {
    return this.cardinal$.pipe(
      switchMap(
        (cardinal: ICardinal) =>
          new Observable<void>(observer => {
            cardinal.on(PaymentEvents.VALIDATED, (event: IOnCardinalValidated) => {
              if (event.ErrorNumber === CardinalClient.CARDINAL_VALIDATION_ERROR) {
                observer.next();
                observer.complete();
                cardinal.off(PaymentEvents.VALIDATED);
              }
            });

            cardinal.start(PaymentBrand, {}, data.jwt);
          })
      )
    );
  }
}
