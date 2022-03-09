import { EMPTY, from, Observable, Subject, timer } from 'rxjs';
import { Service } from 'typedi';
import { CardType, ConfigInterface } from '@trustpayments/3ds-sdk-js';
import { delay, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ofType } from '../../../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { IMessageBus } from '../../../../shared/message-bus/IMessageBus';
import { IThreeDVerificationService } from '../../IThreeDVerificationService';
import { RequestType } from '../../../../../../shared/types/RequestType';
import { ICard } from '../../../../models/ICard';
import { IMerchantData } from '../../../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { ConfigProvider } from '../../../../../../shared/services/config-provider/ConfigProvider';
import { IThreeDLookupResponse } from '../../../../models/IThreeDLookupResponse';
import { IGatewayClient } from '../../../gateway-client/IGatewayClient';
import { threeDSecureConfigName } from './IThreeDSecure';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { BrowserDataProvider } from './BrowserDataProvider';
import { ThreeDSecureChallengeService } from './ThreeDSecureChallengeService';
import { ThreeDSecureMethodService } from './ThreeDSecureMethodService';
import { IBrowserData } from './data/IBrowserData';
import { ThreeDLookupRequest } from './data/ThreeDLookupRequest';

@Service()
export class ThreeDSecureVerificationService implements IThreeDVerificationService<ConfigInterface> {

  private static readonly THREEDSECURE_PROCESSING_SCREEN_HIDE_DELAY = 2000;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private gatewayClient: IGatewayClient,
    private configProvider: ConfigProvider,
    private threeDSMethodService: ThreeDSecureMethodService,
    private browserDataProvider: BrowserDataProvider,
    private challengeService: ThreeDSecureChallengeService,
    private messageBus: IMessageBus,
  ) {
  }

  init$(): Observable<ConfigInterface> {
    return this.configProvider.getConfig$().pipe(
      map(config => ({
        type: PUBLIC_EVENTS.THREE_D_SECURE_INIT,
        data: config[threeDSecureConfigName],
      })),
      switchMap((queryEvent: IMessageBusEvent<ConfigInterface>) => {
        return from(this.interFrameCommunicator.query<ConfigInterface>(queryEvent, MERCHANT_PARENT_FRAME));
      }),
    );
  }

  binLookup$(): Observable<void> {
    return EMPTY;
  }

  start$(
    jsInitResponse: IThreeDInitResponse,
    requestTypes: RequestType[],
    card: ICard,
    merchantData: IMerchantData,
  ): Observable<IThreeDQueryResponse> {
    if (!requestTypes.includes(RequestType.THREEDQUERY)) {
      return this.performRequestWithoutThreedQuery$(card, merchantData);
    }

    let cardType = '';
    let threedstransactionid = '';
    const threeDSecureProcessingScreenTimer = timer(ThreeDSecureVerificationService.THREEDSECURE_PROCESSING_SCREEN_HIDE_DELAY);
    const hideProcessingScreenQueryEvent: IMessageBusEvent<undefined> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
    };
    const isTransactionComplete$: Subject<boolean> = new Subject();

    // Start processing screen timeout
    threeDSecureProcessingScreenTimer.subscribe();

    // Hide processing screen on every transaction complete event
    this.messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).pipe(
      delay(ThreeDSecureVerificationService.THREEDSECURE_PROCESSING_SCREEN_HIDE_DELAY),
      switchMap(() => from(this.interFrameCommunicator.query<void>(hideProcessingScreenQueryEvent, MERCHANT_PARENT_FRAME))),
      takeUntil(isTransactionComplete$),
    ).subscribe(() => {
      isTransactionComplete$.next(true);
    });

    const lookupRequest = new ThreeDLookupRequest(card);

    return this.gatewayClient.threedLookup(lookupRequest).pipe(
      switchMap((response: IThreeDLookupResponse) => {
        cardType = response.paymenttypedescription;
        threedstransactionid = response.threedstransactionid;

        const queryEvent: IMessageBusEvent<string> = {
          type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW,
          data: cardType,
        };

        return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
          map(() => response),
        );
      }),
      switchMap((response: IThreeDLookupResponse) => this.threeDSMethodService.perform3DSMethod$(
        response.threedmethodurl,
        response.threednotificationurl,
        response.threedstransactionid,
      )),
      switchMap(() => this.browserDataProvider.getBrowserData$(threedstransactionid)),
      map((browserData: IBrowserData) => new ThreeDQueryRequest(card, merchantData, browserData)),
      switchMap((requestData: ThreeDQueryRequest) => this.gatewayClient.threedQuery(requestData)),
      switchMap((response: IThreeDQueryResponse) => {
        if (!response.acsurl) {
          return threeDSecureProcessingScreenTimer.pipe(
            switchMap(() => from(this.interFrameCommunicator.query<void>(hideProcessingScreenQueryEvent, MERCHANT_PARENT_FRAME))),
            map(() => response),
            tap(() => {
              isTransactionComplete$.next(true);
            }),
          );
        }

        return threeDSecureProcessingScreenTimer.pipe(
          switchMap(() => from(this.interFrameCommunicator.query<void>(hideProcessingScreenQueryEvent, MERCHANT_PARENT_FRAME))),
          switchMap(() => this.challengeService.doChallenge$(response, cardType as CardType)),
          tap(() => {
            isTransactionComplete$.next(true);
          }),
        );
      }),
    );
  }

  private performRequestWithoutThreedQuery$(card: ICard, merchantData: IMerchantData): Observable<IThreeDQueryResponse> {
    return this.gatewayClient.threedQuery(new ThreeDQueryRequest(card, merchantData));
  }
}
