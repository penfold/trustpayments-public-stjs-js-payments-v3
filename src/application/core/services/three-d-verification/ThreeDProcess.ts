import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Service } from 'typedi';
import { first, mapTo, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { ThreeDVerificationProviderService } from './ThreeDVerificationProviderService';
import { GatewayClient } from '../GatewayClient';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ConfigInterface } from '@trustpayments/3ds-sdk-js';

@Service()
export class ThreeDProcess {
  private jsInitResponse$: Observable<IThreeDInitResponse>;
  private verificationService$: Observable<IThreeDVerificationService<ConfigInterface | void>>;

  constructor(
    private messageBus: IMessageBus,
    private gatewayClient: GatewayClient,
    private threeDVerificationServiceProvider: ThreeDVerificationProviderService,
  ) {}

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

    return this.verificationService$.pipe(mapTo(undefined));
  }

  performThreeDQuery$(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
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
