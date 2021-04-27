import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
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
import { IVerificationData } from './data/IVerificationData';
import { ThreeDVerificationProviderService } from './three-d-verification-provider/ThreeDVerificationProviderService';
import { VerificationResultHandler } from './VerificationResultHandler';
import { GatewayClient } from '../GatewayClient';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';

@Service()
export class ThreeDProcess {
  private jsInit$: Observable<IThreeDInitResponse>;
  private verificationService: IThreeDVerificationService;

  constructor(
    private messageBus: IMessageBus,
    private gatewayClient: GatewayClient,
    private verificationResultHandler: VerificationResultHandler,
    private threeDVerificationServiceProvider: ThreeDVerificationProviderService,
  ) {}

  init$(tokens?: IThreeDSTokens): Observable<void> {
    const jsInit$: Observable<IThreeDInitResponse> = this.gatewayClient.jsInit().pipe(
      tap((jsInitResponse: IThreeDInitResponse) => {
        this.verificationService = this.threeDVerificationServiceProvider.getProvider(jsInitResponse.threedsprovider);
      }),
    );
    const initialTokens$ = tokens ? of(tokens) : jsInit$;
    const updatedTokens$ = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.UPDATE_JWT),
      switchMap(() => jsInit$),
    );

    this.jsInit$ = merge(initialTokens$, updatedTokens$).pipe(shareReplay(1));

    return this.jsInit$.pipe(
      first(),
      switchMap((jsInitResponse: IThreeDInitResponse) => this.initVerificationService(jsInitResponse))
    );
  }

  performThreeDQuery(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IThreeDQueryResponse> {
    return this.jsInit$.pipe(
      first(),
      switchMap((jsInitResponse: IThreeDInitResponse) => {
        const includesThreeDQuery = () => requestTypes.includes('THREEDQUERY');

        return iif(includesThreeDQuery, this.verificationService.start(jsInitResponse.threedinit), of(null)).pipe(
          mapTo(new ThreeDQueryRequest(jsInitResponse.cachetoken, card, merchantData)),
          switchMap(request => {
            return this.gatewayClient.threedQuery(request);
          }),
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
      })
    );
  }

  private initVerificationService(jsInitResponse: IThreeDInitResponse): Observable<void> {
    return this.verificationService.init(jsInitResponse).pipe(
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => this.verificationService.binLookup(event.data));
      })
    );
  }

  private authenticateCard(response: IThreeDQueryResponse, jsInitResponse: IThreeDInitResponse): Observable<IThreeDQueryResponse> {
    const verificationData: IVerificationData = {
      transactionId: response.acquirertransactionreference,
      jwt: jsInitResponse.threedinit,
      acsUrl: response.acsurl,
      payload: response.threedpayload,
    };

    return this.verificationService.verify(verificationData).pipe(
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap(validationResult => this.verificationResultHandler.handle(response, validationResult, jsInitResponse)),
    );
  }

  private isThreeDAuthorisationRequired(threeDResponse: IThreeDQueryResponse): boolean {
    return threeDResponse.enrolled === 'Y' && threeDResponse.acsurl !== undefined;
  }
}
