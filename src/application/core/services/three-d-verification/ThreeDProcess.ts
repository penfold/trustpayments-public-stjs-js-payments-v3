import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Service } from 'typedi';
import { mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IAuthorizePaymentResponse } from '../../models/IAuthorizePaymentResponse';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { ThreeDSTokensProvider } from './ThreeDSTokensProvider';
import { IVerificationData } from './data/IVerificationData';
import { VerificationResultHandler } from './VerificationResultHandler';
import { GatewayClient } from '../GatewayClient';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';

@Service()
export class ThreeDProcess {
  private threeDSTokens$: Observable<IThreeDSTokens>;

  constructor(
    private verificationService: IThreeDVerificationService,
    private messageBus: MessageBus,
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

    return this.initVerificationService();
  }

  performThreeDQuery(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IAuthorizePaymentResponse> {
    return this.threeDSTokens$.pipe(
      switchMap(tokens =>
        this.verificationService
          .start(tokens.jwt)
          .pipe(mapTo(new ThreeDQueryRequest(tokens.cacheToken, requestTypes, card, merchantData)))
      ),
      switchMap(request => this.gatewayClient.threedQuery(request)),
      switchMap(response => this.authenticateCard(response)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
    );
  }

  private initVerificationService(): Observable<void> {
    return this.threeDSTokens$.pipe(
      switchMap(tokens => this.verificationService.init(tokens.jwt)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')),
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => this.verificationService.binLookup(event.data));
      })
    );
  }

  private authenticateCard(response: IThreeDQueryResponse): Observable<IAuthorizePaymentResponse> {
    return this.threeDSTokens$.pipe(
      switchMap(tokens => {
        const isCardEnrolledAndNotFrictionless = response.enrolled === 'Y' && response.acsurl !== undefined;

        if (isCardEnrolledAndNotFrictionless) {
          const verificationData: IVerificationData = {
            transactionId: response.acquirertransactionreference,
            jwt: tokens.jwt,
            acsUrl: response.acsurl,
            payload: response.threedpayload
          };

          return this.verificationService.verify(verificationData).pipe(
            tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
            switchMap(validationResult => this.verificationResultHandler.handle(validationResult, tokens))
          );
        }

        return of<IAuthorizePaymentResponse>({
          threedresponse: '',
          cachetoken: tokens.cacheToken
        });
      })
    );
  }
}
