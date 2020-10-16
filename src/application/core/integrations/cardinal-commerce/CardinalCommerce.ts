import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { StCodec } from '../../services/st-codec/StCodec.class';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { Service } from 'typedi';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { CardinalCommerceTokensProvider } from './CardinalCommerceTokensProvider';
import { map, mapTo, switchMap, tap } from 'rxjs/operators';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { Observable, of, throwError } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { IAuthorizePaymentResponse } from '../../models/IAuthorizePaymentResponse';
import { CardinalRemoteClient } from './CardinalRemoteClient';
import { GatewayClient } from '../../services/GatewayClient';
import { IContinueData } from '../../../../shared/integrations/cardinal-commerce/IContinueData';
import { ThreeDQueryRequest } from './ThreeDQueryRequest';
import { IValidationResult } from '../../../../shared/integrations/cardinal-commerce/IValidationResult';
import { ActionCode } from '../../../../shared/integrations/cardinal-commerce/ActionCode';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';

@Service()
export class CardinalCommerce {
  private cardinalTokens: ICardinalCommerceTokens;

  constructor(
    private messageBus: MessageBus,
    private notification: NotificationService,
    private tokenProvider: CardinalCommerceTokensProvider,
    private stTransport: StTransport,
    private cardinalClient: CardinalRemoteClient,
    private gatewayClient: GatewayClient
  ) {}

  init(): Observable<ICardinalCommerceTokens | undefined> {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.UPDATE_JWT),
        switchMap(_ => this.tokenProvider.getTokens())
      )
      .subscribe(tokens => (this.cardinalTokens = tokens));

    return this.ensureCardinalReady();
  }

  performThreeDQuery(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IAuthorizePaymentResponse> {
    return this.ensureCardinalReady().pipe(
      switchMap(tokens =>
        this.cardinalClient
          .start(tokens.jwt)
          .pipe(mapTo(new ThreeDQueryRequest(tokens.cacheToken, requestTypes, card, merchantData)))
      ),
      switchMap(request => this.gatewayClient.threedQuery(request)),
      switchMap(response => this._authenticateCard(response)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
    );
  }

  private _authenticateCard(responseObject: IThreeDQueryResponse): Observable<IAuthorizePaymentResponse | undefined> {
    const isCardEnrolledAndNotFrictionless = responseObject.enrolled === 'Y' && responseObject.acsurl !== undefined;

    if (!isCardEnrolledAndNotFrictionless) {
      return of(undefined);
    }

    return this.createContinueData(responseObject).pipe(
      switchMap((data: IContinueData) => this.cardinalClient.continue(data)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap(validationResult => this.handleCardValidationResult(validationResult))
    );
  }

  private ensureCardinalReady(): Observable<ICardinalCommerceTokens> {
    if (this.cardinalTokens) {
      return of(this.cardinalTokens);
    }

    return this.getCardinalTokens().pipe(
      switchMap(tokens => this.cardinalClient.setup(tokens.jwt)),
      map(() => this.cardinalTokens),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')),
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => this.cardinalClient.binProcess(event.data));
      })
    );
  }

  private createContinueData(threeDQueryResponse: IThreeDQueryResponse): Observable<IContinueData> {
    return this.getCardinalTokens().pipe(
      map(tokens => ({
        transactionId: threeDQueryResponse.acquirertransactionreference,
        jwt: tokens.jwt,
        acsUrl: threeDQueryResponse.acsurl,
        payload: threeDQueryResponse.threedpayload
      }))
    );
  }

  private handleCardValidationResult(validationResult: IValidationResult): Observable<IAuthorizePaymentResponse> {
    switch (validationResult.ActionCode) {
      case ActionCode.ERROR:
        this.notification.error(COMMUNICATION_ERROR_INVALID_RESPONSE);
        return throwError(validationResult);
      case ActionCode.FAILURE:
        StCodec.publishResponse(
          this.stTransport._threeDQueryResult.response,
          this.stTransport._threeDQueryResult.jwt,
          validationResult.jwt
        );
        return throwError(validationResult);
      case ActionCode.SUCCESS:
      case ActionCode.NOACTION:
        return of({
          cachetoken: this.cardinalTokens.cacheToken,
          threedresponse: validationResult.jwt
        });
    }
  }

  private getCardinalTokens(): Observable<ICardinalCommerceTokens> {
    if (this.cardinalTokens) {
      return of(this.cardinalTokens);
    }

    return this.tokenProvider.getTokens().pipe(tap(tokens => (this.cardinalTokens = tokens)));
  }
}
