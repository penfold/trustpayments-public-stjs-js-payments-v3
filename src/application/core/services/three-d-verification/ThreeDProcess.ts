import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Service } from 'typedi';
import { first, mapTo, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { ThreeDVerificationProviderService } from './ThreeDVerificationProviderService';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ConfigInterface } from '@trustpayments/3ds-sdk-js';
import { IGatewayClient } from '../gateway-client/IGatewayClient';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';

@Service()
export class ThreeDProcess {
  private jsInitResponse$: Observable<IThreeDInitResponse>;
  private verificationService$: Observable<IThreeDVerificationService<ConfigInterface | void>>;
  private destroy$: Observable<IMessageBusEvent<unknown>>;

  constructor(
    private messageBus: IMessageBus,
    private gatewayClient: IGatewayClient,
    private threeDVerificationServiceProvider: ThreeDVerificationProviderService,
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init$(): Observable<void> {
    this.jsInitResponse$ = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.UPDATE_JWT),
      startWith({ type: PUBLIC_EVENTS.UPDATE_JWT }),
      switchMap(() => this.gatewayClient.jsInit()),
      shareReplay(1),
    );

    this.verificationService$ = this.jsInitResponse$.pipe(
      first(),
      switchMap(jsInitResponse => this.initVerificationService$(jsInitResponse)),
      shareReplay(1),
    );

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.THREED_CANCEL), takeUntil(this.destroy$))
      .subscribe(() => this.cancelThreeDProcess());

    return this.verificationService$.pipe(mapTo(undefined));
  }

  performThreeDQuery$(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData,
  ): Observable<IThreeDQueryResponse> {
    return combineLatest([this.verificationService$, this.jsInitResponse$]).pipe(
      first(),
      switchMap(([verificationService, jsInitResponse]) => verificationService.start$(
        jsInitResponse,
        requestTypes,
        card,
        merchantData,
      )),
    );
  }

  cancelThreeDProcess(): void {
    console.error('Cancel should be called');
  }

  private initVerificationService$(jsInitResponse: IThreeDInitResponse): Observable<IThreeDVerificationService<ConfigInterface | void>> {
    const verificationService = this.threeDVerificationServiceProvider.getProvider(jsInitResponse.threedsprovider);

    return verificationService.init$(jsInitResponse).pipe(
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => verificationService.binLookup$(event.data));
      }),
      mapTo(verificationService),
    );
  }
}
