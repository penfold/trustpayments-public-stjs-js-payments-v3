import { Service } from 'typedi';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IApplePayClientStatus } from './IApplePayClientStatus';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IApplePayClient } from './IApplePayClient';
import { IApplePayClientStatusDetails } from './IApplePayClientStatusDetails';
import { IApplePayProcessPaymentResponse } from './apple-pay-payment-service/IApplePayProcessPaymentResponse';
import { IApplePayWalletVerifyResponseBody } from './apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';
import { ApplePayClientStatus } from './ApplePayClientStatus';
import { ApplePayNotificationService } from './apple-pay-notification-service/ApplePayNotificationService';
import { ApplePayPaymentService } from './apple-pay-payment-service/ApplePayPaymentService';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';

@Service()
export class ApplePayClient implements IApplePayClient {
  constructor(
    private applePayNotificationService: ApplePayNotificationService,
    private applePayPaymentService: ApplePayPaymentService,
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
    private localStorage: BrowserLocalStorage,
    private messageBus: IMessageBus,
    private jwtDecoder: JwtDecoder
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
      tap(() => this.localStorage.setItem('completePayment', 'false')),
      switchMap(() => this.messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_STATUS))),
      switchMap((event: IMessageBusEvent<IApplePayClientStatus>) => {
        const { status, details } = event.data;
        switch (status) {
          case ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET:
            return this.noActiveCardsInWallet$(details);

          case ApplePayClientStatus.ON_VALIDATE_MERCHANT:
            return this.onValidateMerchant$(details);

          case ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS:
            return EMPTY;

          case ApplePayClientStatus.VALIDATE_MERCHANT_ERROR:
            return this.onValidateMerchantError$(details);

          case ApplePayClientStatus.ON_PAYMENT_AUTHORIZED:
            return this.onPaymentAuthorized$(details);

          case ApplePayClientStatus.CANCEL:
            return this.onCancel$(details);

          case ApplePayClientStatus.SUCCESS:
            return this.onSuccess$(details);

          case ApplePayClientStatus.ERROR:
            return this.onError$(details);

          case ApplePayClientStatus.EMPTY_JWT_ERROR:
            return this.onError$(details, true);

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
        type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK,
        data: {
          errorcode: String(details.errorCode),
          ...details
        }
      },
      true
    );

    return of(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);
  }

  private onCancel$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.CANCEL> {
    const { errorCode, errorMessage } = details;
    this.applePayNotificationService.notification(errorCode, errorMessage);
    this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK }, true);
    this.messageBus.publish(
      {
        type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
        data: {
          errorcode: 'cancelled',
          ...details
        }
      },
      true
    );

    return of(ApplePayClientStatus.CANCEL);
  }

  private onPaymentAuthorized$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus> {
    const { config, payment, formData } = details;

    return this.applePayPaymentService
      .processPayment(
        this.jwtDecoder.decode(config.jwtFromConfig).payload.requesttypedescriptions,
        config.validateMerchantRequest,
        formData,
        payment
      )
      .pipe(
        tap(() => this.localStorage.setItem('completePayment', 'true')),
        tap((response: IApplePayProcessPaymentResponse) => {
          this.messageBus.publish(
            {
              type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION,
              data: {
                status: ApplePayClientStatus.ON_PAYMENT_AUTHORIZED,
                details: response
              }
            },
            true
          );
        }),
        mapTo(ApplePayClientStatus.SUCCESS)
      );
  }

  private onSuccess$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.SUCCESS> {
    this.applePayNotificationService.notification(details.errorCode, details.errorMessage);
    this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
    this.messageBus.publish({ type: PUBLIC_EVENTS.RESET_JWT });

    return of(ApplePayClientStatus.SUCCESS);
  }

  private onValidateMerchant$(
    details: IApplePayClientStatusDetails
  ): Observable<ApplePayClientStatus.ON_VALIDATE_MERCHANT> {
    const { validateMerchantURL, config, paymentCancelled } = details;

    return this.applePayPaymentService
      .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
      .pipe(
        tap((response: { status: ApplePayClientErrorCode; data: IApplePayWalletVerifyResponseBody }) => {
          this.messageBus.publish(
            {
              type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT,
              data: {
                status: response.status,
                details: response.data
              }
            },
            true
          );
        }),
        mapTo(ApplePayClientStatus.ON_VALIDATE_MERCHANT)
      );
  }

  private onValidateMerchantError$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.ERROR> {
    this.applePayNotificationService.notification(details.errorCode, details.errorMessage);
    return of(ApplePayClientStatus.ERROR);
  }

  private onError$(
    details: IApplePayClientStatusDetails,
    callTransactionComplete?: boolean
  ): Observable<ApplePayClientStatus.ERROR> {
    this.applePayNotificationService.notification(details.errorCode, details.errorMessage);

    if (callTransactionComplete) {
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK }, true);
      this.messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            ...details,
            errorcode: String(ApplePayClientErrorCode.ERROR)
          }
        },
        true
      );
    }

    return of(ApplePayClientStatus.ERROR);
  }
}
