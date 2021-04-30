import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Service } from 'typedi';
import { first, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';
import { iif, merge, Observable, of } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { ThreeDSTokensProvider } from './ThreeDSTokensProvider';
import { IVerificationData } from './data/IVerificationData';
import { VerificationResultHandler } from './VerificationResultHandler';
import { GatewayClient } from '../GatewayClient';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IThreeDSecure3dsMethod } from '../../../../client/integrations/three-d-secure/IThreeDSecure3dsMethod';

@Service()
export class ThreeDProcess {
  private threeDSTokens$: Observable<IThreeDSTokens>;
  private threeDSmethod: IThreeDSecure3dsMethod;

  constructor(
    private verificationService: IThreeDVerificationService,
    private messageBus: IMessageBus,
    private tokenProvider: ThreeDSTokensProvider,
    private gatewayClient: GatewayClient,
    private verificationResultHandler: VerificationResultHandler
  ) {}

  init(tokens?: IThreeDSTokens): Observable<void> {
    const initialTokens = tokens ? of(tokens) : this.tokenProvider.getTokens();
    const updatedTokens = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.UPDATE_JWT),
      switchMap(_ => this.tokenProvider.getTokens())
    );

    this.threeDSTokens$ = merge(initialTokens, updatedTokens).pipe(shareReplay(1));

    this.gatewayClient.schemaLookup().subscribe(response => {
      this.threeDSmethod = {
        methodUrl: response.methodurl,
        notificationUrl: response.notificationurl,
        threeDSTransactionId: response.threedstransactionid
      }
    });

    return this.threeDSTokens$.pipe(
      first(),
      switchMap(threeDStokens => this.initVerificationService(threeDStokens))
    );
  }

  performThreeDQuery(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IThreeDQueryResponse> {
    return this.threeDSTokens$.pipe(
      first(),
      switchMap(tokens => {
        const includesThreedquery = () => requestTypes.includes('THREEDQUERY');

        return iif(includesThreedquery, this.verificationService.start(tokens.jwt, this.threeDSmethod), of(null)).pipe(
          mapTo(new ThreeDQueryRequest(tokens.cacheToken, card, merchantData)),
          switchMap(request => {
            return this.gatewayClient.threedQuery(request);
          }),
          switchMap(response => {
            if (this.isThreeDAuthorisationRequired(response)) {
              return this.authenticateCard(response, tokens);
            }

            return of({
              ...response,
              cachetoken: tokens.cacheToken,
            });
          }),
          tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
        );
      })
    );
  }

  private initVerificationService(tokens: IThreeDSTokens): Observable<void> {
    return this.verificationService.init(tokens.jwt).pipe(
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')),
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => this.verificationService.binLookup(event.data, this.threeDSmethod));
      })
    );
  }

  private authenticateCard(response: IThreeDQueryResponse, tokens: IThreeDSTokens): Observable<IThreeDQueryResponse> {
    const verificationData: IVerificationData = {
      transactionId: response.acquirertransactionreference,
      jwt: tokens.jwt,
      acsUrl: response.acsurl,
      payload: response.threedpayload,
    };

    return this.verificationService.verify(verificationData).pipe(
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap(validationResult => this.verificationResultHandler.handle(response, validationResult, tokens)),
    );
  }

  private isThreeDAuthorisationRequired(threeDResponse: IThreeDQueryResponse): boolean {
    return threeDResponse.enrolled === 'Y' && threeDResponse.acsurl !== undefined;
  }
}
