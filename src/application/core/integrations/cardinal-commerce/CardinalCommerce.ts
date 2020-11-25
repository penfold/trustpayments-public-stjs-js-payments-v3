import { environment } from '../../../../environments/environment';
import { CardinalCommerceValidationStatus } from '../../models/constants/CardinalCommerceValidationStatus';
import { PaymentBrand } from '../../models/constants/PaymentBrand';
import { PaymentEvents } from '../../models/constants/PaymentEvents';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IOnCardinalValidated } from '../../models/IOnCardinalValidated';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { Service } from 'typedi';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { CardinalCommerceTokensProvider } from './CardinalCommerceTokensProvider';
import { filter, first, map, mapTo, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { from, Observable, of, Subject, throwError } from 'rxjs';
import { ICardinal } from './ICardinal';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { CardinalProvider } from './CardinalProvider';
import { COMMUNICATION_ERROR_INVALID_RESPONSE, PAYMENT_ERROR } from '../../models/constants/Translations';
import { RequestType } from '../../../../shared/types/RequestType';

@Service()
export class CardinalCommerce {
  public static readonly UI_EVENTS = {
    RENDER: 'ui.render',
    CLOSE: 'ui.close'
  };
  private static readonly CARDINAL_VALIDATION_ERROR = 4000;
  private cardinalTokens: ICardinalCommerceTokens;
  private cardinal$: Observable<ICardinal>;
  private cardinalValidated$: Subject<[IOnCardinalValidated, string]>;
  // cardinal.start always throws validation error
  // we ignore it, but use it to track when the start request has completed
  private cardinalValidatedWithoutValidationError$: Observable<[IOnCardinalValidated, string]>;

  private destroy$: Observable<void>;

  constructor(
    private messageBus: MessageBus,
    private notification: NotificationService,
    private framesHub: FramesHub,
    private tokenProvider: CardinalCommerceTokensProvider,
    private stTransport: StTransport,
    private cardinalProvider: CardinalProvider
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(MessageBus.EVENTS_PUBLIC.DESTROY), mapTo(void 0));
    this.cardinalValidated$ = new Subject<[IOnCardinalValidated, string]>();
    this.cardinalValidatedWithoutValidationError$ = this.cardinalValidated$.pipe(
      filter(data => data[0].ErrorNumber !== CardinalCommerce.CARDINAL_VALIDATION_ERROR)
    );

    this.cardinalValidatedWithoutValidationError$
      .pipe(
        map(data => data[0]),
        filter(data => data.ActionCode === 'ERROR')
      )
      .subscribe(() => this.notification.error(COMMUNICATION_ERROR_INVALID_RESPONSE));
  }

  init(config: IConfig): Observable<ICardinal> {
    this.cardinal$ = this.acquireInitialCardinalCommerceTokens(config).pipe(
      switchMap(tokens => this.setupCardinalCommerceLibrary(tokens, Boolean(config.livestatus))),
      tap(cardinal => this._initSubscriptions(cardinal)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')),
      shareReplay(1)
    );

    return this.cardinal$;
  }

  performThreeDQuery(
    requestTypes: RequestType[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IThreeDQueryResponse> {
    const threeDQueryRequestBody = {
      cachetoken: this.cardinalTokens.cacheToken,
      termurl: 'https://termurl.com', // TODO this shouldn't be needed but currently the backend needs this
      ...merchantData,
      ...card
    };

    return this.cardinal$.pipe(
      switchMap(cardinal => {
        if (requestTypes.includes('THREEDQUERY')) {
          return this.startTransaction(cardinal, this.cardinalTokens.jwt);
        }

        return of(null);
      }),
      switchMap(() => from(this.stTransport.sendRequest(threeDQueryRequestBody))),
      map((response: { response: IThreeDQueryResponse; jwt: string }) => ({ ...response.response, jwt: response.jwt })),
      switchMap((response: IThreeDQueryResponse) => {
        if (this.isThreeDAuthorisationRequired(response)) {
          return this._authenticateCard(response);
        }

        return of(response);
      })
    );
  }

  private acquireInitialCardinalCommerceTokens(config: IConfig): Observable<ICardinalCommerceTokens> {
    const { threedinit, cachetoken } = config.init;

    if (threedinit && cachetoken) {
      return of((this.cardinalTokens = { jwt: threedinit, cacheToken: cachetoken }));
    }

    return this.acquireCardinalCommerceTokens();
  }

  private acquireCardinalCommerceTokens(): Observable<ICardinalCommerceTokens> {
    return this.tokenProvider.getTokens().pipe(
      tap(tokens => (this.cardinalTokens = tokens)),
      tap(tokens =>
        this.messageBus.publish({
          type: MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED,
          data: tokens
        })
      )
    );
  }

  private setupCardinalCommerceLibrary(tokens: ICardinalCommerceTokens, liveStatus: boolean): Observable<ICardinal> {
    return this.cardinalProvider.getCardinal$(liveStatus).pipe(
      switchMap(cardinal => {
        cardinal.configure(environment.CARDINAL_COMMERCE.CONFIG);

        cardinal.on(CardinalCommerce.UI_EVENTS.RENDER, () => {
          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_SHOW }, true);
        });
        cardinal.on(CardinalCommerce.UI_EVENTS.CLOSE, () => {
          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_HIDE }, true);
        });
        cardinal.on(PaymentEvents.VALIDATED, (data: IOnCardinalValidated, jwt: string) => {
          this.cardinalValidated$.next([data, jwt]);
        });

        return new Observable<ICardinal>(observer => {
          cardinal.on(PaymentEvents.SETUP_COMPLETE, () => {
            observer.next(cardinal);
            observer.complete();
            this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true);
          });

          cardinal.setup(PaymentEvents.INIT, {
            jwt: tokens.jwt
          });
        });
      })
    );
  }

  private startTransaction(cardinal: ICardinal, jwt: string): Observable<void> {
    return new Observable(observer => {
      this.cardinalValidated$
        .pipe(
          filter(data => data[0].ErrorNumber === CardinalCommerce.CARDINAL_VALIDATION_ERROR),
          first(),
          mapTo(undefined)
        )
        .subscribe(observer);

      cardinal.start(PaymentBrand, {}, jwt);
    });
  }

  private _authenticateCard(responseObject: IThreeDQueryResponse): Observable<IThreeDQueryResponse> {
    const cardinalContinue = (cardinal: ICardinal) => {
      cardinal.continue(
        PaymentBrand,
        {
          AcsUrl: responseObject.acsurl,
          Payload: responseObject.threedpayload
        },
        {
          Cart: [],
          OrderDetails: {
            TransactionId: responseObject.acquirertransactionreference
          }
        },
        this.cardinalTokens.jwt
      );
    };

    return this.cardinal$.pipe(
      tap(cardinal => cardinalContinue(cardinal)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap(() => this.cardinalValidatedWithoutValidationError$.pipe(first())),
      switchMap(([validationResult, jwt]: [IOnCardinalValidated, string]) => {
        if (
          !CardinalCommerceValidationStatus.includes(validationResult.ActionCode) ||
          validationResult.ActionCode === 'FAILURE'
        ) {
          const updatedResponseObject = {
            ...responseObject,
            acquirerresponsecode: String(validationResult.ErrorNumber),
            acquirerresponsemessage: validationResult.ErrorDescription,
            errorcode: '50003',
            errormessage: PAYMENT_ERROR,
            threedresponse: jwt,
            cachetoken: this.cardinalTokens.cacheToken
          };

          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);

          return throwError(updatedResponseObject);
        }

        return of({
          ...responseObject,
          threedresponse: jwt,
          cachetoken: this.cardinalTokens.cacheToken
        });
      }),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
    );
  }

  private _initSubscriptions(cardinal: ICardinal): void {
    this.messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT),
        switchMap(() => this.acquireCardinalCommerceTokens()),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS), takeUntil(this.destroy$))
      .subscribe((event: IMessageBusEvent<string>) => cardinal.trigger(PaymentEvents.BIN_PROCESS, event.data));

    this.destroy$.subscribe(() => {
      cardinal.off(PaymentEvents.SETUP_COMPLETE);
      cardinal.off(PaymentEvents.VALIDATED);
      cardinal.off(CardinalCommerce.UI_EVENTS.RENDER);
      cardinal.off(CardinalCommerce.UI_EVENTS.CLOSE);
    });
  }

  private isThreeDAuthorisationRequired(threeDResponse: IThreeDQueryResponse): boolean {
    return threeDResponse.enrolled === 'Y' && threeDResponse.acsurl !== undefined;
  }
}
