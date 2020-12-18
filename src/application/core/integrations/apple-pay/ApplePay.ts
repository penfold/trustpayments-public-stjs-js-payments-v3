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
import { ApplePayErrorCode } from './apple-pay-error-service/ApplePayErrorCode';
import { APPLE_PAY_BUTTON_ID } from './apple-pay-button-service/ApplePayButtonProperties';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { VALIDATION_ERROR } from '../../models/constants/Translations';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { ApplePayErrorService } from './apple-pay-error-service/ApplePayErrorService';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePay {
  private applePaySession: IApplePaySession;
  private config: IApplePayConfigObject;
  private paymentCancelled: boolean = false;

  constructor(
    private communicator: InterFrameCommunicator,
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private applePayButtonService: ApplePayButtonService,
    private applePayConfigService: ApplePayConfigService,
    private applePayErrorService: ApplePayErrorService,
    private applePaySessionFactory: ApplePaySessionFactory,
    private applePaySessionService: ApplePaySessionService
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
                    data: {
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
          this.gestureHandler();
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

  private proceedPayment(): void {
    this.paymentCancelled = false;
    // need to be here because of gesture handler
    this.applePaySession = this.applePaySessionFactory.create(this.config.applePayVersion, this.config.paymentRequest);
    this.applePaySessionService.init(this.applePaySession, this.config.paymentRequest);
    console.error(this.config);
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
        filter(event => event.data.requesttypedescription !== 'WALLETVERIFY'),
        first()
      )
      .subscribe(event => {
        if (Number(event.data.errorcode) !== 0) {
          this.applePaySession.completePayment({
            status: ApplePaySession.STATUS_FAILURE,
            errors: this.applePayErrorService.create(ApplePayErrorCode.UNKNOWN, this.config.locale)
          });
        }
      });

    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      console.error('dupa');
      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.ON_VALIDATE_MERCHANT,
          data: {
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
          console.error(response);
          if (response.data.errorCode !== ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS) {
            this.applePaySessionService.abortApplePaySession();
            this.handleWalletVerifyResponse(
              ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
              ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR,
              VALIDATION_ERROR
            );

            GoogleAnalytics.sendGaData(
              'event',
              'Apple Pay',
              `${ApplePayClientStatus.VALIDATE_MERCHANT_ERROR}`,
              'Apple Pay merchant validation error'
            );
            return of(ApplePayClientStatus.VALIDATE_MERCHANT_ERROR);
          }
          this.handleWalletVerifyResponse(
            ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS,
            ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS,
            'Merchant validation success'
          );
          GoogleAnalytics.sendGaData(
            'event',
            'Apple Pay',
            `${ApplePayClientStatus.VALIDATE_MERCHANT_ERROR}`,
            'Apple Pay Merchant validation success'
          );
          return of(ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS);
        });
    };

    this.applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      this.messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.ON_PAYMENT_AUTHORIZED,
          data: {
            errorCode: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
            event,
            config: this.config
          }
        }
      });

      // this.interFrameCommunicator
      //   .whenReceive(PUBLIC_EVENTS.APPLE_PAY_COMPLETE_SESSION)
      //   .thenRespond(() => {
      //     this.handlePaymentProcessResponse(response.errorCode, response.errorMessage);
      //     this.applePaySession.completePayment();
      //   });
    };

    this.applePaySession.oncancel = (event: Event) => {
      this.gestureHandler();
      this.paymentCancelled = true;
      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.CANCEL,
          data: {
            errorCode: ApplePayClientErrorCode.CANCEL,
            errorMessage: 'Payment has been cancelled'
          }
        }
      });
      GoogleAnalytics.sendGaData(
        'event',
        'Apple Pay',
        `${ApplePayClientStatus.CANCEL}`,
        'Apple Pay Payment has been cancelled'
      );
    };
  }

  private handleWalletVerifyResponse(status: ApplePayClientStatus, code: ApplePayClientErrorCode, message: string) {
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status,
        data: { errorCode: code, errorMessage: message }
      }
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

    if (errorCode === ApplePayClientErrorCode.SUCCESS) {
      completion.status = ApplePaySession.STATUS_SUCCESS;
      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.SUCCESS,
          data: {
            errorCode: ApplePayClientErrorCode.SUCCESS,
            errorMessage
          }
        }
      });
      this.applePaySession.completePayment(completion);
      return completion;
    }
    if (errorCode === ApplePayClientErrorCode.CANCEL) {
      this.applePaySessionService.abortApplePaySession();
      return completion;
    }
    completion.errors = this.applePayErrorService.create(ApplePayErrorCode.UNKNOWN, this.config.locale);
    completion.status = ApplePaySession.STATUS_FAILURE;

    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status: ApplePayClientStatus.ERROR,
        data: {
          errorCode,
          errorMessage
        }
      }
    });
    this.applePaySessionService.abortApplePaySession();
    return completion;
  }

  private gestureHandler(): void {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);
    const handler = () => {
      this.proceedPayment();
      button.removeEventListener('click', handler);
    };

    if (button) {
      button.addEventListener('click', handler);
    }
  }
}
