import { EMPTY, from, Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { IThreeDVerificationService } from '../../IThreeDVerificationService';
import { ConfigInterface } from '3ds-sdk-js';
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

  init(): Observable<ConfigInterface> {
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

  binLookup(): Observable<void> {
    return EMPTY;
  }

  start(
    jsInitResponse: IThreeDInitResponse,
    requestTypes: RequestType[],
    card: ICard,
    merchantData: IMerchantData,
  ): Observable<IThreeDQueryResponse> {
    if (!requestTypes.includes(RequestType.THREEDQUERY)) {
      return this.performRequestWithoutThreedQuery$(card, merchantData);
    }

    return this.gatewayClient.schemaLookup(card).pipe(
      switchMap(response => this.threeDSMethodService.perform3DSMethod$(response.methodurl, response.notificationurl, response.threedstransactionid)),
      switchMap(() => this.browserDataProvider.getBrowserData$()),
      map(browserData => new ThreeDQueryRequest(card, merchantData, browserData)),
      switchMap(requestData => this.gatewayClient.threedQuery(requestData)),
      switchMap(response => {
        if (!response.acsurl) {
          return of(response);
        }

        return this.challengeService.doChallenge$(response);
      }),
    );
  }

  private performRequestWithoutThreedQuery$(card: ICard, merchantData: IMerchantData): Observable<IThreeDQueryResponse> {
    return this.gatewayClient.threedQuery(new ThreeDQueryRequest(card, merchantData));
  }
}
