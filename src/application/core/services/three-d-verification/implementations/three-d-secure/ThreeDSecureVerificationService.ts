import { EMPTY, from, Observable, of, throwError } from 'rxjs';
import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { IThreeDVerificationService } from '../../IThreeDVerificationService';
import { ConfigInterface, MethodURLResultInterface, ChallengeResultInterface } from '3ds-sdk-js';
import { RequestType } from '../../../../../../shared/types/RequestType';
import { ICard } from '../../../../models/ICard';
import { IMerchantData } from '../../../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { GatewayClient } from '../../../GatewayClient';
import { map, switchMap } from 'rxjs/operators';
import { ConfigProvider } from '../../../../../../shared/services/config-provider/ConfigProvider';
import { IMethodUrlData } from '../../../../../../client/integrations/three-d-secure/IMethodUrlData';
import { BrowserDataInterface, ThreeDSecureVersion } from '3ds-sdk-js';
import { IChallengeData } from '../../../../../../client/integrations/three-d-secure/IChallengeData';
import { PAYMENT_ERROR } from '../../../../models/constants/Translations';

@Service()
export class ThreeDSecureVerificationService implements IThreeDVerificationService<ConfigInterface> {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private gatewayClient: GatewayClient,
    private configProvider: ConfigProvider,
  ) {}

  init(): Observable<ConfigInterface> {
    return this.configProvider.getConfig$().pipe(
      map(config => ({
        type: PUBLIC_EVENTS.THREE_D_SECURE_INIT,
        data: config.threeDSecure,
      })),
      switchMap((queryEvent: IMessageBusEvent<ConfigInterface>) =>
        from(this.interFrameCommunicator.query<ConfigInterface>(queryEvent, MERCHANT_PARENT_FRAME))
      ),
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

    return this.gatewayClient.schemaLookup(card.pan).pipe(
      switchMap(response => this.perform3DSMethod$(response.methodurl, response.notificationurl, response.threedstransactionid)),
      switchMap(() => this.getBrowserData$()),
      map(browserData => ({ ...card, ...merchantData, ...browserData })),
      switchMap(requestData => this.gatewayClient.threedQuery(requestData)),
      switchMap(response => {
        if (!response.acsurl) {
          return of(response);
        }

        return this.authenticateCard(response);
      }),
    );
  }

  private performRequestWithoutThreedQuery$(card: ICard, merchantData: IMerchantData): Observable<IThreeDQueryResponse> {
    return this.gatewayClient.threedQuery({ ...card, ...merchantData });
  }

  private perform3DSMethod$(methodUrl: string, notificationUrl: string, transactionId: string): Observable<MethodURLResultInterface> {
    if (!methodUrl) {
      return of(undefined);
    }

    const queryEvent: IMessageBusEvent<IMethodUrlData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_METHOD_URL,
      data: {
        methodUrl,
        notificationUrl,
        transactionId,
      },
    }

    return from(this.interFrameCommunicator.query<MethodURLResultInterface>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  private getBrowserData$(): Observable<Record<string, string>> {
    const queryEvent: IMessageBusEvent = { type: PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA };

    return from(this.interFrameCommunicator.query<BrowserDataInterface>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
      map(browserData => {
        const mapProperty = ([key, value]: [string, unknown]) => [key.toLowerCase(), JSON.stringify(value)];
        const entries = Object.entries(browserData).map(mapProperty);

        return Object.fromEntries(entries);
      }),
    );
  }

  private authenticateCard(response: IThreeDQueryResponse): Observable<IThreeDQueryResponse> {
    const queryEvent: IMessageBusEvent<IChallengeData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE,
      data: {
        version: response.threedversion as ThreeDSecureVersion,
        payload: response.threedpayload,
        challengeURL: response.acsurl,
      },
    };

    return from(this.interFrameCommunicator.query<ChallengeResultInterface>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
      switchMap((challengeResult: ChallengeResultInterface) => {
        switch (challengeResult.status as string) {
          case 'FAILURE':
          case 'ERROR':
            return throwError({
              ...response,
              acquirerresponsemessage: challengeResult.description,
              errorcode: '50003',
              errormessage: PAYMENT_ERROR,
              threedresponse: challengeResult.data,
            });
          default:
            return of({ ...response, threedresponse: challengeResult.data });
        }
      }),
    );
  }
}
