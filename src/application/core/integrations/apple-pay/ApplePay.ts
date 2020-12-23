import { Service } from 'typedi';
import { EMPTY, of, throwError } from 'rxjs';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { IApplePayClientStatus } from '../../../../client/integrations/apple-pay/IApplePayClientStatus';
import { IApplePayConfigObject } from './apple-pay-config-service/IApplePayConfigObject';
import { IApplePayPaymentAuthorizationResult } from './apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from './apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePaySession } from './apple-pay-session-service/IApplePaySession';
import { IApplePayValidateMerchantEvent } from './apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { ApplePayClientStatus } from '../../../../client/integrations/apple-pay/ApplePayClientStatus';
import { ApplePayClientErrorCode } from '../../../../client/integrations/apple-pay/ApplePayClientErrorCode';
import { ApplePaySessionErrorCode } from './apple-pay-error-service/ApplePaySessionErrorCode';
import { APPLE_PAY_BUTTON_ID } from './apple-pay-button-service/ApplePayButtonProperties';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { ApplePayErrorService } from './apple-pay-error-service/ApplePayErrorService';
import { ApplePayGestureService } from './apple-pay-gesture-service/ApplePayGestureService';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { RequestType } from '../../../../shared/types/RequestType';
import { IApplePayClientStatusDetails } from '../../../../client/integrations/apple-pay/IApplePayClientStatusDetails';
import { DomMethods } from '../../shared/dom-methods/DomMethods';

const ApplePaySession = (window as any).ApplePaySession;

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
    private communicator: InterFrameCommunicator,
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus
  ) {}

  init(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_CONFIG))
      .pipe(
        switchMap((event: IMessageBusEvent<IConfig>) => {
          if (!Boolean(ApplePaySession)) {
            return throwError('Works only on Safari');
          }

          if (!ApplePaySession.canMakePayments()) {
            return throwError('Your device does not support making payments with Apple Pay');
          }

          return of(event.data);
        }),

        switchMap((config: IConfig) => {
          return this.applePaySessionService.canMakePaymentsWithActiveCard(config.applePay.merchantId).pipe(
            switchMap((canMakePayment: boolean) => {
              if (!canMakePayment) {
                this.messageBus.publish<IApplePayClientStatus>({
                  type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
                  data: {
                    status: ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET,
                    details: {
                      errorCode: ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET,
                      errorMessage: 'User has not an active card provisioned into Wallet'
                    }
                  }
                });
                GoogleAnalytics.sendGaData(
                  'event',
                  'Apple Pay',
                  `${ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET}`,
                  'User has not an active card provisioned into Wallet'
                );
                return throwError('User has not an active card provisioned into Wallet');
              }

              return of(config);
            })
          );
        }),

        map((config: IConfig) => {
          this.config = this.applePayConfigService.setConfig(config, {
            walletmerchantid: '',
            walletrequestdomain: window.location.hostname,
            walletsource: 'APPLEPAY',
            walletvalidationurl: ''
          });
          return this.config;
        }),

        tap((config: IApplePayConfigObject) => {
          this.applePayButtonService.insertButton(
            APPLE_PAY_BUTTON_ID,
            config.applePayConfig.buttonText,
            config.applePayConfig.buttonStyle,
            config.applePayConfig.paymentRequest.countryCode
          );
        }),

        tap(() => {
          this.applePayGestureService.gestureHandle(this.proceedPayment.bind(this));
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

  private onTransactionComplete(): void {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
        filter(event => event.data.requesttypedescription !== RequestType.WALLETVERIFY),
        first()
      )
      .subscribe((event: IMessageBusEvent) => {
        if (Number(event.data.errorcode) !== ApplePayClientErrorCode.SUCCESS) {
          this.applePaySession.completePayment({
            status: ApplePaySession.STATUS_FAILURE,
            errors: this.applePayErrorService.create(ApplePaySessionErrorCode.UNKNOWN, this.config.locale)
          });
        }
      });
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

      this.interFrameCommunicator
        .whenReceive(PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT)
        .thenRespond((response: IMessageBusEvent) => {
          if (Number(response.data.details.errorcode) !== ApplePayClientErrorCode.SUCCESS) {
            this.applePaySessionService.abortApplePaySession();
            this.handleWalletVerifyResponse(ApplePayClientStatus.VALIDATE_MERCHANT_ERROR, response.data.details);
            GoogleAnalytics.sendGaData(
              'event',
              'Apple Pay',
              `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`,
              'Apple Pay merchant validation error'
            );

            return of(ApplePayClientStatus.ON_VALIDATE_MERCHANT);
          }

          this.handleWalletVerifyResponse(ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS, response.data.details);
          this.applePaySessionService.completeMerchantValidation(JSON.parse(response.data.details.walletsession));
          GoogleAnalytics.sendGaData(
            'event',
            'Apple Pay',
            `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`,
            'Apple Pay Merchant validation success'
          );

          return of(response.data);
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

      this.interFrameCommunicator
        .whenReceive(PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION)
        .thenRespond((response: IMessageBusEvent) => {
          this.handlePaymentProcessResponse(
            response.data.details.data.response.errorcode,
            response.data.details.data.response.errormessage
          );
          return of(response.data);
        });
    };
  }

  private onCancel(): void {
    this.applePaySession.oncancel = (event: Event) => {
      this.paymentCancelled = true;
      this.applePayGestureService.gestureHandle(this.proceedPayment.bind(this));

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

  private proceedPayment(): void {
    this.paymentCancelled = false;
    this.applePaySession = this.applePaySessionFactory.create(this.config.applePayVersion, this.config.paymentRequest);
    this.applePaySessionService.init(this.applePaySession, this.config.paymentRequest);
    this.onTransactionComplete();
    this.onValidateMerchant();
    this.onPaymentAuthorized();
    this.onCancel();
  }

  private handleWalletVerifyResponse(status: ApplePayClientStatus, details: IApplePayClientStatusDetails): void {
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: { status, details }
    });
  }

  private handlePaymentProcessResponse(
    errorCode: ApplePayClientErrorCode,
    errorMessage: string
  ): IApplePayPaymentAuthorizationResult {
    const completion: IApplePayPaymentAuthorizationResult = {
      errors: undefined,
      status: undefined
    };

    switch (Number(errorCode)) {
      case ApplePayClientErrorCode.SUCCESS:
        completion.status = ApplePaySession.STATUS_SUCCESS;
        this.messageBus.publish<IApplePayClientStatus>({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.SUCCESS,
            details: {
              errorCode: ApplePayClientErrorCode.SUCCESS,
              errorMessage
            }
          }
        });
        this.applePaySession.completePayment(completion);
        GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
        return completion;

      case ApplePayClientErrorCode.CANCEL:
        this.applePaySessionService.abortApplePaySession();
        return completion;

      default:
        completion.errors = this.applePayErrorService.create(ApplePaySessionErrorCode.UNKNOWN, this.config.locale);
        completion.status = ApplePaySession.STATUS_FAILURE;

        this.messageBus.publish<IApplePayClientStatus>({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.ERROR,
            details: {
              errorCode,
              errorMessage
            }
          }
        });
        this.applePaySessionService.abortApplePaySession();

        return completion;
    }
  }
}
