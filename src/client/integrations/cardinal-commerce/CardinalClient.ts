import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IInitializationData } from './data/IInitializationData';
import { CardinalProvider } from './CardinalProvider';
import { first, mapTo, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ICardinal } from './ICardinal';
import { defer, Observable, Subject, Subscription } from 'rxjs';
import { PaymentEvents } from '../../../application/core/models/constants/PaymentEvents';
import { IConfig } from '../../../shared/model/config/IConfig';
import { PaymentBrand } from '../../../application/core/models/constants/PaymentBrand';
import { ITriggerData } from './data/ITriggerData';
import { IValidationResult } from './data/IValidationResult';
import { environment } from '../../../environments/environment';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IOnCardinalValidated } from '../../../application/core/models/IOnCardinalValidated';
import { IVerificationData } from '../../../application/core/services/three-d-verification/data/IVerificationData';
import { IVerificationResult } from '../../../application/core/services/three-d-verification/data/IVerificationResult';
import { ActionCode } from '../../../application/core/services/three-d-verification/data/ActionCode';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';

@Service()
export class CardinalClient {
  private static readonly CARDINAL_VALIDATION_ERROR = 4000;
  private cardinal$: Observable<ICardinal>;
  private threeDPopupCancel$: Subject<void>;
  private destroy$: Observable<IMessageBusEvent<unknown>>;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private cardinalProvider: CardinalProvider,
    private configProvider: ConfigProvider
  ) {
    this.cardinal$ = defer(() =>
      this.configProvider.getConfig$().pipe(
        switchMap((config: IConfig) => this.cardinalProvider.getCardinal$(Boolean(config.livestatus))),
        shareReplay(1)
      )
    );

    this.threeDPopupCancel$ = new Subject<void>();
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_SETUP)
      .thenRespond((event: IMessageBusEvent<IInitializationData>) => this.cardinalSetup(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_CONTINUE)
      .thenRespond((event: IMessageBusEvent<IVerificationData>) => this.cardinalContinue(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_TRIGGER)
      .thenRespond((event: IMessageBusEvent<ITriggerData<any>>) => this.cardinalTrigger(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.CARDINAL_START)
      .thenRespond((event: IMessageBusEvent<IInitializationData>) => this.cardinalStart(event.data));

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.THREED_CANCEL), takeUntil(this.destroy$))
      .subscribe(() => this.cancelThreeDProcess());
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

  private cardinalContinue(data: IVerificationData): Observable<IVerificationResult> {
    return this.cardinal$.pipe(
      switchMap(
        (cardinal: ICardinal) =>
          new Observable<IVerificationResult>(subscriber => {
            const cancelSubscription: Subscription = this.threeDPopupCancel$.subscribe(() => {
              subscriber.next({
                validated: false,
                actionCode: ActionCode.FAILURE,
                errorNumber: 4001,
                errorDescription: '3DS process has been cancelled'
              });
            });

            cardinal.on(PaymentEvents.VALIDATED, (result: IValidationResult, responseJwt: string) => {
              if (result.ErrorNumber !== CardinalClient.CARDINAL_VALIDATION_ERROR) {
                subscriber.next({
                  validated: result.Validated,
                  actionCode: result.ActionCode,
                  errorNumber: result.ErrorNumber,
                  errorDescription: result.ErrorDescription,
                  jwt: responseJwt
                });
                subscriber.complete();
                cardinal.off(PaymentEvents.VALIDATED);
                cancelSubscription.unsubscribe();
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
              }
            });

            cardinal.start(PaymentBrand, {}, data.jwt);
          })
      )
    );
  }

  private cancelThreeDProcess(): void {
    this.threeDPopupCancel$.next();
    const cardinalElementContainer = document.getElementById('Cardinal-ElementContainer');

    if (!cardinalElementContainer) {
      return;
    }

    cardinalElementContainer.parentNode.removeChild(cardinalElementContainer);
  }
}
