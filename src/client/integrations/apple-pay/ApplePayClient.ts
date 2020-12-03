import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { filter, switchMap } from 'rxjs/operators';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { Service } from 'typedi';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IUpdateJwt } from '../../../application/core/models/IUpdateJwt';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IApplePayClientStatus } from './IApplePayClientStatus';
import {
  APPLE_PAY_NOT_LOGGED,
  MERCHANT_VALIDATION_FAILURE,
  PAYMENT_CANCELLED,
  PAYMENT_ERROR
} from '../../../application/core/models/constants/Translations';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { NotificationService } from '../../notification/NotificationService';
import { ApplePayClientStatus } from './ApplePayClientStatus';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayNetworksService } from '../../../application/core/integrations/apple-pay/apple-pay-networks-service/ApplePayNetworksService';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { ApplePayNotificationService } from './apple-pay-notification-service/ApplePayNotificationService';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';

@Service()
export class ApplePayClient {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject<IConfig>(null);

  constructor(
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: MessageBus,
    private notificationService: NotificationService,
    private localStorage: BrowserLocalStorage,
    private applePayButtonService: ApplePayButtonService,
    private applePayNetworkService: ApplePayNetworksService,
    private applePayConfigService: ApplePayConfigService,
    private applePayNotificationService: ApplePayNotificationService
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
              case ApplePayClientStatus.SUCCESS:
                return this.onSuccess$(status);
              case ApplePayClientStatus.ERROR:
                return this.onError$(status);
              case ApplePayClientStatus.CANCEL:
                return this.onCancel$(status);
              case ApplePayClientStatus.VALIDATE_MERCHANT_ERROR:
                return this.onValidateMerchant$(status);
              case ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD:
                return this.canMakePaymentWithActiveCard$(status);
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
      const { applePay, formId, jwt } = this.applePayConfigService.getConfigData(v);
      const { currencyiso3a, mainamount, locale } = this.applePayConfigService.getStJwtData(jwt);
      this.config$.next(v);
    });
    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT))
      .subscribe((event: IMessageBusEvent<IUpdateJwt>) => {
        this.config$.next({
          ...this.config$.value,
          jwt: event.data.newJwt
        });
      });
  }

  private onSuccess$(status: IApplePayClientStatus): Observable<ApplePayClientStatus.SUCCESS> {
    console.error('onSuccess$:', status);
    this.localStorage.setItem('completePayment', 'true');
    this.applePayNotificationService.notification(status.data.errorcode, status.data.errormessage);
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
    return of(ApplePayClientStatus.SUCCESS);
  }

  private onError$(status: IApplePayClientStatus): Observable<ApplePayClientStatus.ERROR> {
    console.error('onError$:', status);
    this.notificationService.error(PAYMENT_ERROR);
    this.localStorage.setItem('completePayment', 'false');
    return of(ApplePayClientStatus.ERROR);
  }

  private onCancel$(status: IApplePayClientStatus): Observable<ApplePayClientStatus.CANCEL> {
    console.error('onCancel$:', status);
    this.notificationService.cancel(PAYMENT_CANCELLED);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, data: {} }, true);
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');
    return of(ApplePayClientStatus.CANCEL);
  }

  private onValidateMerchant$(status: IApplePayClientStatus): Observable<ApplePayClientStatus.VALIDATE_MERCHANT_ERROR> {
    console.error('onValidateMerchant$:', status);
    this.notificationService.error(MERCHANT_VALIDATION_FAILURE);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    this.notificationService.error(`${status.data.errorcode}: ${status.data.errormessage}`);
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validation failure');
    return of(ApplePayClientStatus.VALIDATE_MERCHANT_ERROR);
  }

  private canMakePaymentWithActiveCard$(
    status: IApplePayClientStatus
  ): Observable<ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD> {
    console.error('ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD');
    status.data.errormessage
      ? GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments')
      : GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay cannot make payments');
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    this.notificationService.error(APPLE_PAY_NOT_LOGGED);
    return of(ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD);
  }
}
