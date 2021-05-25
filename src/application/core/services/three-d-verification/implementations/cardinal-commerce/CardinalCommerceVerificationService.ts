import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { from, Observable, of } from 'rxjs';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IInitializationData } from '../../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { ITriggerData } from '../../../../../../client/integrations/cardinal-commerce/data/ITriggerData';
import { PaymentEvents } from '../../../../models/constants/PaymentEvents';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { IThreeDVerificationService } from '../../IThreeDVerificationService';
import { ICard } from '../../../../models/ICard';
import { IMerchantData } from '../../../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { mapTo, switchMap, tap } from 'rxjs/operators';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { GoogleAnalytics } from '../../../../integrations/google-analytics/GoogleAnalytics';
import { RequestType } from '../../../../../../shared/types/RequestType';
import { GatewayClient } from '../../../GatewayClient';
import { CardinalChallengeService } from './CardinalChallengeService';

@Service()
export class CardinalCommerceVerificationService implements IThreeDVerificationService<void> {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private gatewayClient: GatewayClient,
    private challengeService: CardinalChallengeService,
  ) {}

  init$(jsInitResponse: IThreeDInitResponse): Observable<void> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_SETUP,
      data: {
        jwt: jsInitResponse.threedinit,
      },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  binLookup$(pan: string): Observable<void> {
    const queryEvent: IMessageBusEvent<ITriggerData<string>> = {
      type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
      data: {
        eventName: PaymentEvents.BIN_PROCESS,
        data: pan,
      },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  start$(
    jsInitResponse: IThreeDInitResponse,
    requestTypes: RequestType[],
    card: ICard,
    merchantData: IMerchantData,
  ): Observable<IThreeDQueryResponse> {
    return this.callCardinalStart$(requestTypes, jsInitResponse.threedinit).pipe(
      mapTo(new ThreeDQueryRequest(jsInitResponse.cachetoken, card, merchantData)),
      switchMap(request => this.gatewayClient.threedQuery(request)),
      switchMap(response => {
        if (this.challengeService.isChallengeRequired(response)) {
          return this.challengeService.runChallenge$(response, jsInitResponse);
        }

        return of({
          ...response,
          cachetoken: jsInitResponse.cachetoken,
        });
      }),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
    );
  }

  private callCardinalStart$(requestTypes: RequestType[], jwt: string): Observable<void> {
    if (!requestTypes.includes(RequestType.THREEDQUERY)) {
      return of(undefined);
    }

    const startQueryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_START,
      data: { jwt },
    };

    return from(this.interFrameCommunicator.query<void>(startQueryEvent, MERCHANT_PARENT_FRAME));
  }
}
