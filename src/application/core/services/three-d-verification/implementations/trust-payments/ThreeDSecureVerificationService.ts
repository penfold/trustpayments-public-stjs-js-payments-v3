import { EMPTY, from, Observable, timer } from 'rxjs';
import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { IThreeDVerificationService } from '../../IThreeDVerificationService';
import { CardType, ConfigInterface } from '@trustpayments/3ds-sdk-js';
import { RequestType } from '../../../../../../shared/types/RequestType';
import { ICard } from '../../../../models/ICard';
import { IMerchantData } from '../../../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { GatewayClient } from '../../../GatewayClient';
import { map, switchMap } from 'rxjs/operators';
import { ConfigProvider } from '../../../../../../shared/services/config-provider/ConfigProvider';
import { threeDSecureConfigName } from './IThreeDSecure';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { BrowserDataProvider } from './BrowserDataProvider';
import { ThreeDSecureChallengeService } from './ThreeDSecureChallengeService';
import { ThreeDSecureMethodService } from './ThreeDSecureMethodService';
import { IThreeDLookupResponse } from '../../../../models/IThreeDLookupResponse';
import { IBrowserData } from './data/IBrowserData';

@Service()
export class ThreeDSecureVerificationService implements IThreeDVerificationService<ConfigInterface> {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private gatewayClient: GatewayClient,
    private configProvider: ConfigProvider,
    private threeDSMethodService: ThreeDSecureMethodService,
    private browserDataProvider: BrowserDataProvider,
    private challengeService: ThreeDSecureChallengeService,
  ) {}

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
    const threeDSecureProcessingScreenTimer = timer(2000);
    threeDSecureProcessingScreenTimer.subscribe();

    return this.gatewayClient.threedLookup(card).pipe(
      switchMap((response: IThreeDLookupResponse) => {
        cardType = response.paymenttypedescription;

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
      switchMap(() => this.browserDataProvider.getBrowserData$()),
      map((browserData: IBrowserData) => new ThreeDQueryRequest(card, merchantData, browserData)),
      switchMap((requestData: ThreeDQueryRequest) => this.gatewayClient.threedQuery(requestData)),
      switchMap((response: IThreeDQueryResponse) => {
        const queryEvent: IMessageBusEvent<undefined> = {
          type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
        };

        if (!response.acsurl) {
          return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
            map(() => response),
          );
        }

        return threeDSecureProcessingScreenTimer.pipe(
          switchMap(() => from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME))),
          switchMap(() => this.challengeService.doChallenge$(response, cardType as CardType)),
        );
      }),
    );
  }

  private performRequestWithoutThreedQuery$(card: ICard, merchantData: IMerchantData): Observable<IThreeDQueryResponse> {
    return this.gatewayClient.threedQuery(new ThreeDQueryRequest(card, merchantData));
  }
}
