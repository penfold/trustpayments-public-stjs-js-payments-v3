import JwtDecode from 'jwt-decode';
import { Service } from 'typedi';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IApplePayClientStatus } from './IApplePayClientStatus';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IApplePayClient } from './IApplePayClient';
import { IApplePayPaymentAuthorizedEvent } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { IApplePayClientErrorDetails } from './IApplePayClientErrorDetails';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePayClientStatus } from './ApplePayClientStatus';
import { ApplePayNotificationService } from './apple-pay-notification-service/ApplePayNotificationService';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { NotificationService } from '../../notification/NotificationService';
import { ApplePayPaymentService } from './apple-pay-payment-service/ApplePayPaymentService';
import { IDecodedJwt } from '../../../application/core/models/IDecodedJwt';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';

@Service()
export class ApplePayClient implements IApplePayClient {
  constructor(
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private notificationService: NotificationService,
    private localStorage: BrowserLocalStorage,
    private applePayNotificationService: ApplePayNotificationService,
    private applePayPaymentService: ApplePayPaymentService
  ) {}

  init$(): Observable<ApplePayClientStatus> {
    return this.configProvider.getConfig$().pipe(
      tap((config: IConfig) => {
        this.messageBus.publish<IConfig>(
          {
            type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
            data: config
          },
          true
        );
      }),
      switchMap(() => this.messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_STATUS))),
      switchMap((event: IMessageBusEvent<IApplePayClientStatus>) => {
        switch (event.data.status) {
          case ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET:
            return this.noActiveCardsInWallet$(event.data);

          case ApplePayClientStatus.ON_VALIDATE_MERCHANT:
            return this.onValidateMerchant$(event.data);

          case ApplePayClientStatus.ON_PAYMENT_AUTHORIZED:
            return this.onPaymentAuthorized$(event.data.status, event.data.data.event, event.data.data.config);

          case ApplePayClientStatus.CANCEL:
            return this.onCancel$(event.data);

          default:
            return throwError('Unknown Apple Pay status');
        }
      })
    );
  }

  private noActiveCardsInWallet$(
    status: IApplePayClientStatus
  ): Observable<ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET> {
    this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    this.messageBus.publish(
      {
        data: {
          errorCode: status.data.errorCode,
          errorMessage: status.data.errorMessage
        },
        type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK
      },
      true
    );

    return of(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);
  }

  private onValidateMerchant$(
    status: IApplePayClientStatus
  ): Observable<ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS | ApplePayClientStatus.VALIDATE_MERCHANT_ERROR> {
    const {
      data: { validateMerchantEvent, config, paymentCancelled }
    } = status;
    this.applePayPaymentService
      .walletVerify(config.validateMerchantRequest, validateMerchantEvent.validationURL, paymentCancelled)
      .subscribe((response: IApplePayClientErrorDetails) => {
        from(
          this.interFrameCommunicator.query(
            {
              type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT,
              data: response
            },
            MERCHANT_PARENT_FRAME
          )
        ).subscribe((response: any) => {
          console.error(response);
          this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
          return of(status.data);
        });
      });
  }

  private onPaymentAuthorized$(
    status: ApplePayClientStatus,
    event: IApplePayPaymentAuthorizedEvent,
    config: IApplePayConfigObject
  ): Observable<ApplePayClientStatus.SUCCESS> {
    // processPayment
    // query do parent frame - end apple pay session success / error
    // wait for answ.
    // end payment in ApplePay
    // then => notifications / callbacks

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.APPLE_PAY_STATUS)
      .thenRespond((messageBusEvent: IMessageBusEvent) => {
        this.applePayPaymentService
          .processPayment(
            JwtDecode<IDecodedJwt>(config.jwtFromConfig).payload.requesttypedescriptions,
            config.validateMerchantRequest,
            config.formId,
            event
          )
          .pipe(
            switchMap((response: IApplePayClientErrorDetails) => {
              this.messageBus.publish(
                {
                  data: response,
                  type: MessageBus.EVENTS_PUBLIC.APPLE_PAY_AUTHORIZATION_STATUS
                },
                true
              );
              return of(ApplePayClientStatus.SUCCESS);
            }),
            catchError(() => {
              this.messageBus.publish(
                {
                  data: false,
                  type: MessageBus.EVENTS_PUBLIC.APPLE_PAY_AUTHORIZATION_STATUS
                },
                true
              );
              return of(ApplePayClientStatus.ERROR);
            })
          );
        return of(event.data);
      });

    // GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
    //
    // this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    // this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    // GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validation failure');

    return of(ApplePayClientStatus.SUCCESS);
  }

  private onSuccess$(
    event: IApplePayPaymentAuthorizedEvent,
    config: IApplePayConfigObject
  ): Observable<ApplePayClientStatus.SUCCESS> {
    // this.localStorage.setItem('completePayment', 'true');
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

    return of(ApplePayClientStatus.CANCEL);
  }
}
