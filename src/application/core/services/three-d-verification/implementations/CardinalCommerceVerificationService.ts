import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { from, Observable, of } from 'rxjs';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { IInitializationData } from '../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { ITriggerData } from '../../../../../client/integrations/cardinal-commerce/data/ITriggerData';
import { PaymentEvents } from '../../../models/constants/PaymentEvents';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { IThreeDVerificationService } from '../IThreeDVerificationService';
import { ICard } from '../../../models/ICard';
import { IMerchantData } from '../../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';
import { mapTo, switchMap, tap } from 'rxjs/operators';
import { ThreeDQueryRequest } from '../data/ThreeDQueryRequest';
import { GoogleAnalytics } from '../../../integrations/google-analytics/GoogleAnalytics';
import { RequestType } from '../../../../../shared/types/RequestType';
import { GatewayClient } from '../../GatewayClient';
import { IVerificationData } from '../data/IVerificationData';
import { IVerificationResult } from '../data/IVerificationResult';
import { VerificationResultHandler } from '../VerificationResultHandler';

@Service()
export class CardinalCommerceVerificationService implements IThreeDVerificationService<void> {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private gatewayClient: GatewayClient,
    private verificationResultHandler: VerificationResultHandler,
  ) {}

  init(jsInitResponse: IThreeDInitResponse): Observable<void> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_SETUP,
      data: {
        jwt: jsInitResponse.threedinit,
      },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  binLookup(pan: string): Observable<void> {
    const queryEvent: IMessageBusEvent<ITriggerData<string>> = {
      type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
      data: {
        eventName: PaymentEvents.BIN_PROCESS,
        data: pan,
      },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  start(
    jsInitResponse: IThreeDInitResponse,
    requestTypes: RequestType[],
    card: ICard,
    merchantData: IMerchantData,
  ): Observable<IThreeDQueryResponse> {
    return this.callCardinalStart(requestTypes, jsInitResponse.threedinit).pipe(
      mapTo(new ThreeDQueryRequest(jsInitResponse.cachetoken, card, merchantData)),
      switchMap(request => this.gatewayClient.threedQuery(request)),
      switchMap(response => {
        if (this.isThreeDAuthorisationRequired(response)) {
          return this.authenticateCard(response, jsInitResponse);
        }

        return of({
          ...response,
          cachetoken: jsInitResponse.cachetoken,
        });
      }),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
    );
  }

  private callCardinalStart(requestTypes: RequestType[], jwt: string): Observable<void> {
    if (!requestTypes.includes(RequestType.THREEDQUERY)) {
      return of(undefined);
    }

    const startQueryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_START,
      data: { jwt },
    };

    return from(this.interFrameCommunicator.query<void>(startQueryEvent, MERCHANT_PARENT_FRAME));
  }

  private isThreeDAuthorisationRequired(threeDResponse: IThreeDQueryResponse): boolean {
    return threeDResponse.enrolled === 'Y' && threeDResponse.acsurl !== undefined;
  }

  private authenticateCard(response: IThreeDQueryResponse, jsInitResponse: IThreeDInitResponse): Observable<IThreeDQueryResponse> {
    const verifyQueryEvent: IMessageBusEvent<IVerificationData> = {
      type: PUBLIC_EVENTS.CARDINAL_CONTINUE,
      data: {
        transactionId: response.acquirertransactionreference,
        jwt: jsInitResponse.threedinit,
        acsUrl: response.acsurl,
        payload: response.threedpayload,
      },
    };

    return from(this.interFrameCommunicator.query<IVerificationResult>(verifyQueryEvent, MERCHANT_PARENT_FRAME)).pipe(
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap((validationResult: IVerificationResult) => this.verificationResultHandler.handle(response, validationResult, jsInitResponse)),
    );
  }
}
