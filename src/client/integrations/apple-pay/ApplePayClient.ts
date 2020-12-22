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
import { IApplePayClientStatusDetails } from './IApplePayClientStatusDetails';
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
    private applePayNotificationService: ApplePayNotificationService,
    private applePayPaymentService: ApplePayPaymentService,
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
    private localStorage: BrowserLocalStorage,
    private messageBus: IMessageBus,
    private notificationService: NotificationService
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
        console.error(event);
        const { status, details } = event.data;
        console.error(status, details);
        switch (status) {
          case ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET:
            return this.noActiveCardsInWallet$(details);

          case ApplePayClientStatus.ON_VALIDATE_MERCHANT:
            return this.onValidateMerchant$(details);

          case ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS:
            return this.onValidateMerchantSuccess$(details);

          case ApplePayClientStatus.VALIDATE_MERCHANT_ERROR:
            return this.onValidateMerchantError$(details);

          case ApplePayClientStatus.ON_PAYMENT_AUTHORIZED:
            return this.onPaymentAuthorized$(status, details);

          case ApplePayClientStatus.CANCEL:
            return this.onCancel$(details);

          default:
            return throwError('Unknown Apple Pay status');
        }
      })
    );
  }

  private noActiveCardsInWallet$(
    details: IApplePayClientStatusDetails
  ): Observable<ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET> {
    const { errorCode, errorMessage } = details;
    this.applePayNotificationService.notification(errorCode, errorMessage);
    this.messageBus.publish(
      {
        data: {
          errorCode,
          errorMessage
        },
        type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK
      },
      true
    );

    return of(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);
  }

  private onValidateMerchant$(
    details: IApplePayClientStatusDetails
  ): Observable<ApplePayClientStatus.ON_VALIDATE_MERCHANT> {
    const { errorCode, errorMessage, validateMerchantURL, paymentCancelled, config } = details;
    console.error(details);
    this.applePayPaymentService
      .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
      .subscribe((response: any) => {
        const { status, data } = response;
        from(
          this.interFrameCommunicator.query<IApplePayClientStatus>(
            {
              type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT,
              data: {
                status: ApplePayClientStatus.ON_VALIDATE_MERCHANT,
                details: data
              }
            },
            MERCHANT_PARENT_FRAME
          )
        ).subscribe();
      });
    return of(ApplePayClientStatus.ON_VALIDATE_MERCHANT);
  }

  private onPaymentAuthorized$(
    status: ApplePayClientStatus,
    details: IApplePayClientStatusDetails
  ): Observable<ApplePayClientStatus.SUCCESS> {
    // processPayment
    // query do parent frame - end apple pay session success / error
    // wait for answ.
    // end payment in ApplePay
    // then => notifications / callbacks
    const { config, payment, formData } = details;
    console.error(details);

    this.applePayPaymentService
      .processPayment(
        JwtDecode<IDecodedJwt>(config.jwtFromConfig).payload.requesttypedescriptions,
        config.validateMerchantRequest,
        formData,
        payment
      )
      .pipe(
        switchMap((response: IApplePayClientStatusDetails) => {
          console.error(response);
          this.messageBus.publish(
            {
              data: response,
              type: MessageBus.EVENTS_PUBLIC.APPLE_PAY_AUTHORIZATION
            },
            true
          );
          return of(ApplePayClientStatus.SUCCESS);
        }),
        catchError(() => {
          this.messageBus.publish(
            {
              data: false,
              type: MessageBus.EVENTS_PUBLIC.APPLE_PAY_AUTHORIZATION
            },
            true
          );
          return of(ApplePayClientStatus.ERROR);
        })
      );

    // GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
    //
    // this.applePayNotificationService.notification(status.data.errorCode, status.data.errorMessage);
    // this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    // GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validation failure');

    return of(ApplePayClientStatus.SUCCESS);
  }

  private onValidateMerchantError$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.ERROR> {
    console.error(details);
    return of(ApplePayClientStatus.ERROR);
  }

  private onValidateMerchantSuccess$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.SUCCESS> {
    console.error(details);
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

  private onCancel$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.CANCEL> {
    this.applePayNotificationService.notification(details.errorCode, details.errorMessage);
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
