import { Service } from 'typedi';
import { ConfigInterface } from '@trustpayments/3ds-sdk-js';
import { combineLatest, Observable } from 'rxjs';
import { first, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { EventScope } from '../../models/constants/EventScope';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { ThreeDVerificationProviderService } from './ThreeDVerificationProviderService';
import { JsInitResponseService } from './JsInitResponseService';

@Service()
export class ThreeDProcess {
  private jsInitResponse$: Observable<IThreeDInitResponse>;
  private verificationService$: Observable<IThreeDVerificationService<ConfigInterface | void>>;

  constructor(
    private messageBus: IMessageBus,
    private threeDVerificationServiceProvider: ThreeDVerificationProviderService,
    private jsInitResponseService: JsInitResponseService,
  ) {}

  init$(): Observable<void> {
    this.jsInitResponse$ = this.jsInitResponseService.getJsInitResponse();

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

  private initVerificationService$(jsInitResponse: IThreeDInitResponse): Observable<IThreeDVerificationService<ConfigInterface | void>> {
    const verificationService = this.threeDVerificationServiceProvider.getProvider(jsInitResponse.threedsprovider);

    return verificationService.init$(jsInitResponse).pipe(
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON },  EventScope.ALL_FRAMES)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => verificationService.binLookup$(event.data));
      }),
      mapTo(verificationService),
    );
  }
}
