import { mapTo, Observable, first, switchMap, takeUntil, tap, of } from 'rxjs';
import { IApplePayValidateMerchantEvent } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { ApplePayClientErrorCode } from '../../../application/core/integrations/apple-pay/ApplePayClientErrorCode';
import { ApplePayClientStatus } from '../../../application/core/integrations/apple-pay/ApplePayClientStatus';
import { IApplePayClientStatus } from '../../../application/core/integrations/apple-pay/IApplePayClientStatus';
import { EventScope } from '../../../application/core/models/constants/EventScope';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IApplePayClientStatusDetails } from '../../../application/core/integrations/apple-pay/IApplePayClientStatusDetails';
import { Service } from 'typedi';
import { ApplePayPaymentService } from './ApplePayPaymentService';
@Service()
export class ApplePayVerifyService {
  applePaySession: any;
  config: any;
  applePaySessionService: any;
  private destroy$: Observable<IMessageBusEvent>;
  configProvider: any;
  localStorage: any;
  applePayNotificationService: any;

  constructor(private messageBus: IMessageBus, private applePayPaymentService: ApplePayPaymentService) {}

  init$(): Observable<ApplePayClientStatus> {
    return this.configProvider.getConfig$().pipe(
      tap((config: IConfig) => {
        this.messageBus.publish<IConfig>(
          {
            type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
            data: config
          },
          EventScope.ALL_FRAMES
        );
      }),
      tap(() => this.localStorage.setItem('completePayment', 'false')),
      // 3. handle the query - send request to the gateway part1
      switchMap(() => this.messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_STATUS))),
      switchMap((event: IMessageBusEvent<IApplePayClientStatus>) => {
        const { status, details } = event.data;
        switch (status) {
          case ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET:
            return this.noActiveCardsInWallet$(details);

          case ApplePayClientStatus.ON_VALIDATE_MERCHANT:
            return this.onValidateMerchant$(details);

          case ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS:
            return of(ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS);

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
            return this.onError$(details);

          default:
            return console.error('Unknown Apple Pay status');
        }
      })
    );
  }

  validateMerchant() {
    // 1. handle callback from apple pay session
    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      // 2. send query to application side
      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.ON_VALIDATE_MERCHANT,
          details: {
            errorCode: ApplePayClientErrorCode.ON_VALIDATE_MERCHANT,
            errorMessage: '',
            validateMerchantURL: event.validationURL,
            config: this.config
          }
        }
      });

      this.messageBus
        .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT), first(), takeUntil(this.destroy$))
        .subscribe(
          (
            response: IMessageBusEvent<{ status: ApplePayClientErrorCode; details: IApplePayWalletVerifyResponseBody }>
          ) => {
            if (Number(response.data.status) === ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS) {
              this.handleWalletVerifyResponse(ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS, response.data.details);
              this.applePaySessionService.completeMerchantValidation(response.data.details.walletsession);
              return;
            }

            if (
              Number(response.data.status) === ApplePayClientErrorCode.CANCEL ||
              response.data.details.errorcode === 'cancelled'
            ) {
              return;
            }

            this.handleWalletVerifyResponse(ApplePayClientStatus.VALIDATE_MERCHANT_ERROR, response.data.details);
          }
        );
    };
  }

  private handleWalletVerifyResponse(status: ApplePayClientStatus, details: IApplePayWalletVerifyResponseBody): void {
    switch (Number(details.errorcode)) {
      case 30000:
        this.applePaySessionService.abort();
        this.messageBus.publish<IApplePayClientStatus>({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
            details: {
              errorMessage: details.errormessage,
              errorCode: Number(details.errorcode)
            }
          }
        });
        break;

      default:
        this.messageBus.publish<IApplePayClientStatus>({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status,
            details: {
              errorMessage: details.errormessage,
              errorCode: Number(details.errorcode)
            }
          }
        });
    }
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
      EventScope.ALL_FRAMES
    );

    return of(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);
  }

  private onCancel$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.CANCEL> {
    const { errorCode, errorMessage } = details;
    this.applePayNotificationService.notification(errorCode, errorMessage);
    this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK }, EventScope.ALL_FRAMES);
    this.messageBus.publish(
      {
        type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
        data: {
          errorcode: 'cancelled'
        }
      },
      EventScope.ALL_FRAMES
    );

    return of(ApplePayClientStatus.CANCEL);
  }

  private onPaymentAuthorized$(details: IApplePayClientStatusDetails): any {
    console.log(details);
  }

  private onSuccess$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.SUCCESS> {
    console.log(details);
  }

  private onValidateMerchant$(
    details: IApplePayClientStatusDetails
  ): Observable<ApplePayClientStatus.ON_VALIDATE_MERCHANT> {
    const { validateMerchantURL, config, paymentCancelled } = details;

    // 3. handle the query - send request to the gateway part2
    return this.applePayPaymentService
      .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
      .pipe(
        tap((response: { status: ApplePayClientErrorCode; data: IApplePayWalletVerifyResponseBody }) => {
          this.messageBus.publish(
            {
              type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT,
              data: {
                status: response.status,
                details: response.data,
              },
            },
            EventScope.ALL_FRAMES
          );
        }),
        mapTo(ApplePayClientStatus.ON_VALIDATE_MERCHANT)
      );
  }

  private onValidateMerchantError$(details: IApplePayClientStatusDetails): Observable<ApplePayClientStatus.ERROR> {
    this.applePayNotificationService.notification(details.errorCode, details.errorMessage);
    return of(ApplePayClientStatus.ERROR);
  }

  private onError$(details: IApplePayClientStatusDetails): any {
    console.log(details);
  }
}
