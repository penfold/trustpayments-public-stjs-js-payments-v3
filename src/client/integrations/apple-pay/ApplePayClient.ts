import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { filter, switchMap, tap } from 'rxjs/operators';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { Service } from 'typedi';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IUpdateJwt } from '../../../application/core/models/IUpdateJwt';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IApplePayClientStatus } from './IApplePayClientStatus';
import { PAYMENT_CANCELLED } from '../../../application/core/models/constants/Translations';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { NotificationService } from '../../notification/NotificationService';
import { ApplePayClientStatus } from './ApplePayClientStatus';

@Service()
export class ApplePayClient {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject<IConfig>(null);

  constructor(
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
    private _messageBus: MessageBus,
    private _notificationService: NotificationService
  ) {}

  init$(): any {
    return this.config$.pipe(
      filter((config: IConfig) => config !== null),
      switchMap((config: IConfig) => {
        return from(
          this.interFrameCommunicator.query(
            {
              type: PUBLIC_EVENTS.APPLE_PAY_START,
              data: config as IConfig
            },
            MERCHANT_PARENT_FRAME
          )
        ).pipe(
          switchMap((status: IApplePayClientStatus) => {
            switch (status.status) {
              case ApplePayClientStatus.CANCEL:
                return this._onCancel$();
              default:
                return throwError('Unknown Apple Pay status');
            }
          })
        );
      })
    );
  }

  watchConfigAndJwtUpdates(): void {
    this.configProvider.getConfig$().subscribe(v => {
      this.config$.next(v);
    });
    this._messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT))
      .subscribe((event: IMessageBusEvent<IUpdateJwt>) => {
        this.config$.next({
          ...this.config$.value,
          jwt: event.data.newJwt
        });
      });
  }

  private _onSuccess$(): void {
    return;
  }

  private _onError$(): void {
    return;
  }

  private _onCancel$(): Observable<ApplePayClientStatus.CANCEL> {
    this._notificationService.cancel(PAYMENT_CANCELLED);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, data: { errorcode: event } }, true);
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');
    return of(ApplePayClientStatus.CANCEL);
  }

  private _onValidateMerchant$(): void {
    return;
  }

  private _canMakePaymentWithActiveCard() {
    return;
  }
}
