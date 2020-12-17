import { Service } from 'typedi';
import { Observable, of, throwError } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IApplePayClientStatus } from './IApplePayClientStatus';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IApplePayClient } from './IApplePayClient';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePayClientStatus } from './ApplePayClientStatus';
import { ApplePayNotificationService } from './apple-pay-notification-service/ApplePayNotificationService';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { NotificationService } from '../../notification/NotificationService';

@Service()
export class ApplePayClient implements IApplePayClient {
  constructor(
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private notificationService: NotificationService,
    private localStorage: BrowserLocalStorage,
    private applePayNotificationService: ApplePayNotificationService
  ) {}

  init$(): Observable<ApplePayClientStatus> {
    return this.configProvider.getConfig$().pipe(
      filter((config: IConfig) => config !== null),
      tap((config: IConfig) => {
        this.messageBus.publish<IConfig>(
          {
            type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
            data: config
          },
          true
        );
      }),
      switchMap((config: IConfig) => {
        return this.messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_STATUS)).pipe(
          switchMap((event: IMessageBusEvent<IApplePayClientStatus>) => {
            switch (event.data.status) {
              case ApplePayClientStatus.SUCCESS:
                return this.onSuccess$(event.data, config);

              case ApplePayClientStatus.ERROR:
                return this.onError$(event.data);

              case ApplePayClientStatus.CANCEL:
                return this.onCancel$(event.data);

              case ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS:
                return this.onValidateMerchantSuccess$(event.data);

              case ApplePayClientStatus.VALIDATE_MERCHANT_ERROR:
                return this.onValidateMerchantError$(event.data);

              case ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD:
                return this.canMakePaymentWithActiveCard$(event.data);

              case ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET:
                return this.noActiveCardsInWallet$(event.data);

              default:
                return throwError('Unknown Apple Pay status');
            }
          })
        );
      })
    );
  }

  private canMakePaymentWithActiveCard$(
    status: IApplePayClientStatus
  ): Observable<ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD> {
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments');

    return of(ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD);
  }

  private noActiveCardsInWallet$(
    status: IApplePayClientStatus
  ): Observable<ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET> {
    this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK
      },
      true
    );
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay cannot make payments');

    return of(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);
  }

  private onSuccess$(status: IApplePayClientStatus, config: IConfig): Observable<ApplePayClientStatus.SUCCESS> {
    this.localStorage.setItem('completePayment', 'true');
    this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');

    return of(ApplePayClientStatus.SUCCESS);
  }

  private onError$(status: IApplePayClientStatus): Observable<ApplePayClientStatus.ERROR> {
    this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    this.localStorage.setItem('completePayment', 'false');
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK
      },
      true
    );
    return of(ApplePayClientStatus.ERROR);
  }

  private onCancel$(status: IApplePayClientStatus): Observable<ApplePayClientStatus.CANCEL> {
    this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK
      },
      true
    );
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE,
        data: {}
      },
      true
    );
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');

    return of(ApplePayClientStatus.CANCEL);
  }

  private onValidateMerchantError$(
    status: IApplePayClientStatus
  ): Observable<ApplePayClientStatus.VALIDATE_MERCHANT_ERROR> {
    this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validation failure');

    return of(ApplePayClientStatus.VALIDATE_MERCHANT_ERROR);
  }

  private onValidateMerchantSuccess$(
    status: IApplePayClientStatus
  ): Observable<ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS> {
    GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');

    return of(ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS);
  }
}
