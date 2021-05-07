import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Service } from 'typedi';
import { first, shareReplay, switchMap, tap } from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { ThreeDVerificationProviderService } from './three-d-verification-provider/ThreeDVerificationProviderService';
import { VerificationResultHandler } from './VerificationResultHandler';
import { GatewayClient } from '../GatewayClient';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ConfigInterface } from '3ds-sdk-js';

@Service()
export class ThreeDProcess {
  private jsInitResponse$: Observable<IThreeDInitResponse>;
  private verificationService: IThreeDVerificationService<ConfigInterface | void>;

  constructor(
    private messageBus: IMessageBus,
    private gatewayClient: GatewayClient,
    private verificationResultHandler: VerificationResultHandler,
    private threeDVerificationServiceProvider: ThreeDVerificationProviderService,
  ) {}

  init$(tokens?: IThreeDSTokens): Observable<ConfigInterface | void> {
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

    this.jsInitResponse$ = merge(initialTokens$, updatedTokens$).pipe(shareReplay(1));

    return this.jsInitResponse$.pipe(
      first(),
      switchMap((jsInitResponse: IThreeDInitResponse) => this.initVerificationService(jsInitResponse)),
    );
  }

  performThreeDQuery(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IThreeDQueryResponse> {
    return this.jsInitResponse$.pipe(
      first(),
      switchMap((jsInitResponse: IThreeDInitResponse) => this.verificationService.start(
        jsInitResponse,
        requestTypes,
        card,
        merchantData,
      )),
    );
  }

  private initVerificationService(jsInitResponse: IThreeDInitResponse): Observable<ConfigInterface | void> {
    return this.verificationService.init(jsInitResponse).pipe(
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => this.verificationService.binLookup(event.data));
      })
    );
  }
}
