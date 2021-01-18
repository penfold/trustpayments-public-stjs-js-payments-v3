import { Service } from 'typedi';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IApplePayClientStatus } from '../../../application/core/integrations/apple-pay/IApplePayClientStatus';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { IApplePayPaymentAuthorizationResult } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePaySession } from './apple-pay-session-service/IApplePaySession';
import { IApplePayValidateMerchantEvent } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { ApplePayClientStatus } from '../../../application/core/integrations/apple-pay/ApplePayClientStatus';
import { ApplePayClientErrorCode } from '../../../application/core/integrations/apple-pay/ApplePayClientErrorCode';
import { ApplePaySessionErrorCode } from '../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePaySessionErrorCode';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { ApplePayErrorService } from '../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorService';
import { ApplePayGestureService } from '../../../application/core/integrations/apple-pay/apple-pay-gesture-service/ApplePayGestureService';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { RequestType } from '../../../shared/types/RequestType';
import { IApplePayClientStatusDetails } from '../../../application/core/integrations/apple-pay/IApplePayClientStatusDetails';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IApplePayProcessPaymentResponse } from '../../../application/core/integrations/apple-pay/apple-pay-payment-service/IApplePayProcessPaymentResponse';

@Service()
export class ApplePay {
  private applePaySession: IApplePaySession;
  private config: IApplePayConfigObject;
  private paymentCancelled: boolean = false;

  constructor(
    private applePayButtonService: ApplePayButtonService,
    private applePayConfigService: ApplePayConfigService,
    private applePayErrorService: ApplePayErrorService,
    private applePayGestureService: ApplePayGestureService,
    private applePaySessionFactory: ApplePaySessionFactory,
    private applePaySessionService: ApplePaySessionService,
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus
  ) {}

  init(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_CONFIG))
      .pipe(
        switchMap((event: IMessageBusEvent<IConfig>) => this.verifyAvailability(event.data)),
        map((config: IConfig) =>
          this.applePayConfigService.getConfig(config, {
            walletmerchantid: '',
            walletrequestdomain: window.location.hostname,
            walletsource: 'APPLEPAY',
            walletvalidationurl: ''
          })
        ),
        tap((config: IApplePayConfigObject) => {
          const applePayConfigAction: IMessageBusEvent<IApplePayConfigObject> = {
            type: PUBLIC_EVENTS.APPLE_PAY_CONFIG_MOCK,
            data: config
          };

          this.config = config;
          this.messageBus.publish(applePayConfigAction);
          this.updateJwtListener();
          this.applePayButtonService.insertButton(
            APPLE_PAY_BUTTON_ID,
            config.applePayConfig.buttonText,
            config.applePayConfig.buttonStyle,
            config.applePayConfig.paymentRequest.countryCode
          );
          this.applePayGestureService.gestureHandle(this.initApplePaySession.bind(this));
        }),
        tap(() => {
          GoogleAnalytics.sendGaData(
            'event',
            'Apple Pay',
            `${ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD}`,
            'Can make payment'
          );
        }),
        catchError((errorMessage: string) => {
          console.error(errorMessage);
          return EMPTY;
        })
      )
      .subscribe();
  }

  private updateJwtListener(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.UPDATE_JWT), takeUntil(this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY))))
      .subscribe((event: IMessageBusEvent) => {
        this.applePayConfigService.updateConfigWithJwtData(event.data.newJwt, this.config);
      });
  }

  private verifyAvailability(config: IConfig): Observable<IConfig> {
    if (!this.applePaySessionService.hasApplePaySessionObject()) {
      return throwError('Works only on Safari');
    }

    if (!this.applePaySessionService.canMakePayments()) {
      return throwError('Your device does not support making payments with Apple Pay');
    }

    return this.applePaySessionService.canMakePaymentsWithActiveCard(config.applePay.merchantId).pipe(
      switchMap((canMakePayment: boolean) =>
        canMakePayment ? of(config) : throwError('User has not an active card provisioned into Wallet')
      ),
      catchError(errorMessage => {
        this.messageBus.publish<IApplePayClientStatus>({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET,
            details: {
              errorMessage,
              errorCode: ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET
            }
          }
        });

        GoogleAnalytics.sendGaData(
          'event',
          'Apple Pay',
          `${ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET}`,
          errorMessage
        );

        return throwError(errorMessage);
      })
    );
  }

  private initApplePaySession(): void {
    this.paymentCancelled = false;
    this.applePaySession = this.applePaySessionFactory.create(this.config.applePayVersion, this.config.paymentRequest);
    this.applePaySessionService.init(this.applePaySession, this.config.paymentRequest);
    this.onValidateMerchant();
    this.onPaymentAuthorized();
    this.onCancel();
    this.onTransactionComplete();
  }

  private onValidateMerchant(): void {
    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.ON_VALIDATE_MERCHANT,
          details: {
            errorCode: ApplePayClientErrorCode.ON_VALIDATE_MERCHANT,
            errorMessage: '',
            validateMerchantURL: event.validationURL,
            config: this.config,
            paymentCancelled: this.paymentCancelled
          }
        }
      });

      this.messageBus
        .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT), first())
        .subscribe((response: IMessageBusEvent) => {
          if (Number(response.data.details.errorcode) === ApplePayClientErrorCode.SUCCESS) {
            this.handleWalletVerifyResponse(ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS, response.data.details);
            this.applePaySessionService.completeMerchantValidation(JSON.parse(response.data.details.walletsession));
            GoogleAnalytics.sendGaData(
              'event',
              'Apple Pay',
              `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`,
              'Apple Pay Merchant validation success'
            );

            return;
          }

          this.handleWalletVerifyResponse(ApplePayClientStatus.VALIDATE_MERCHANT_ERROR, response.data.details);
          GoogleAnalytics.sendGaData(
            'event',
            'Apple Pay',
            `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`,
            'Apple Pay merchant validation error'
          );
        });
    };
  }

  private onPaymentAuthorized(): void {
    this.applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      const formData = DomMethods.parseForm(this.config.formId);

      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.ON_PAYMENT_AUTHORIZED,
          details: {
            config: this.config,
            formData,
            errorCode: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
            errorMessage: '',
            payment: event.payment
          }
        }
      });

      this.messageBus
        .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION), first())
        .subscribe((response: IMessageBusEvent) => {
          this.handlePaymentProcessResponse(response.data.details.errorcode, response.data.details);
        });
    };
  }

  private onCancel(): void {
    this.applePaySession.oncancel = (event: Event) => {
      this.paymentCancelled = true;
      this.applePayGestureService.gestureHandle(this.initApplePaySession.bind(this));

      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.CANCEL,
          details: {
            errorCode: ApplePayClientErrorCode.CANCEL,
            errorMessage: 'Payment has been cancelled'
          }
        }
      });

      GoogleAnalytics.sendGaData('event', 'Apple Pay', `${ApplePayClientStatus.CANCEL}`, 'Payment has been cancelled');
    };
  }

  private onTransactionComplete(): void {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
        filter(event => event.data.requesttypedescription !== RequestType.WALLETVERIFY),
        first()
      )
      .subscribe((event: IMessageBusEvent) => {
        this.applePayGestureService.gestureHandle(this.initApplePaySession.bind(this));
        if (Number(event.data.errorcode) !== ApplePayClientErrorCode.SUCCESS) {
          this.applePaySession.completePayment({
            status: ApplePaySessionService.STATUS_FAILURE
          });
        }
      });
  }

  private handleWalletVerifyResponse(status: ApplePayClientStatus, details: IApplePayClientStatusDetails): void {
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: { status, details }
    });
  }

  private handlePaymentProcessResponse(
    errorCode: ApplePayClientErrorCode,
    details: IApplePayProcessPaymentResponse
  ): IApplePayPaymentAuthorizationResult {
    const completion: IApplePayPaymentAuthorizationResult = {
      errors: undefined,
      status: undefined
    };

    switch (Number(errorCode)) {
      case ApplePayClientErrorCode.SUCCESS:
        completion.status = ApplePaySessionService.STATUS_SUCCESS;
        this.messageBus.publish<IApplePayClientStatus>({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.SUCCESS,
            details: {
              errorMessage: details.errormessage,
              errorCode: Number(details.errorcode)
            }
          }
        });
        this.applePaySession.completePayment(completion);
        GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
        return completion;

      case ApplePayClientErrorCode.CANCEL:
        return completion;

      default:
        completion.errors = this.applePayErrorService.create(ApplePaySessionErrorCode.UNKNOWN, this.config.locale);
        completion.status = ApplePaySessionService.STATUS_FAILURE;

        this.messageBus.publish<IApplePayClientStatus>({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.ERROR,
            details: {
              errorMessage: details.errormessage,
              errorCode: Number(details.errorcode)
            }
          }
        });

        return completion;
    }
  }
}
