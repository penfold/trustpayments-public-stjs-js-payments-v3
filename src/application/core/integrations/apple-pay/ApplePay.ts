import { Service } from 'typedi';
import { from, of } from 'rxjs';
import { filter, first, map, switchMap, take } from 'rxjs/operators';
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
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { VALIDATION_ERROR } from '../../models/constants/Translations';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { ApplePayErrorService } from './apple-pay-error-service/ApplePayErrorService';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePay {
  private applePaySession: IApplePaySession;
  private config: IApplePayConfigObject;
  private paymentCancelled: boolean = false;

  constructor(
    private communicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private applePayButtonService: ApplePayButtonService,
    private applePayConfigService: ApplePayConfigService,
    private applePayErrorService: ApplePayErrorService,
    private applePaySessionFactory: ApplePaySessionFactory,
    private applePaySessionService: ApplePaySessionService,
    private interFrameCommunicator: InterFrameCommunicator
  ) {}

  init(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_CONFIG))
      .pipe(
        map((event: IMessageBusEvent<IConfig>) => {
          if (!Boolean(ApplePaySession)) {
            console.error('Works only on Safari');
            return { status: false, config: event.data };
          }

          if (!ApplePaySession.canMakePayments()) {
            console.error('Your device does not support making payments with Apple Pay');
            return { status: false, config: event.data };
          }

          return { status: true, config: event.data };
        }),
        filter((initObject: { status: boolean; config: IConfig }) => initObject.status),
        switchMap((initObject: { status: boolean; config: IConfig }) => {
          return from(
            this.applePaySessionService.canMakePaymentsWithActiveCard(initObject.config.applePay.merchantId)
          ).pipe(
            map((canMakePayment: boolean) => {
              if (!canMakePayment) {
                console.error('User has not an active card provisioned into Wallet');
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
                return of(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);
              }

              this.applePayButtonService.insertButton(
                APPLE_PAY_BUTTON_ID,
                initObject.config.applePay.buttonText,
                initObject.config.applePay.buttonStyle,
                initObject.config.applePay.paymentRequest.countryCode
              );

              this.config = this.applePayConfigService.setConfig(initObject.config, {
                walletmerchantid: '',
                walletrequestdomain: window.location.hostname,
                walletsource: 'APPLEPAY',
                walletvalidationurl: ''
              });

              this.gestureHandler();
              this.messageBus.publish<IApplePayClientStatus>({
                type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
                data: {
                  status: ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD,
                  data: {
                    errorCode: ApplePayClientErrorCode.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD,
                    errorMessage: 'Can make payment'
                  }
                }
              });
              return of(ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD);
            }),
            take(1)
          );
        })
      )
      .subscribe();
  }

  private proceedPayment(): void {
    this.paymentCancelled = false;
    // need to be here because of gesture handler
    this.applePaySession = this.applePaySessionFactory.create(this.config.applePayVersion, this.config.paymentRequest);
    this.applePaySessionService.init(this.applePaySession, this.config.paymentRequest);

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
      this.interFrameCommunicator
        .query<IApplePayClientStatus>(
          {
            type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
            data: {
              status: ApplePayClientStatus.ON_VALIDATE_MERCHANT,
              data: {
                errorCode: ApplePayClientErrorCode.ON_VALIDATE_MERCHANT,
                event,
                config: this.config,
                paymentCancelled: this.paymentCancelled
              }
            }
          },
          CONTROL_FRAME_IFRAME
        )
        .then((response: IApplePayClientStatus) => {
          if (response.data.errorCode !== ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS) {
            this.applePaySessionService.abortApplePaySession();
            this.handleWalletVerifyResponse(
              ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
              ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR,
              VALIDATION_ERROR
            );
          }
          this.handleWalletVerifyResponse(
            ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS,
            ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS,
            'Merchant validation success'
          );
          return of(code);
        });
    };

    this.applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      this.interFrameCommunicator.query<IApplePayClientStatus>(
        {
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.ON_PAYMENT_AUTHORIZED,
            data: {
              errorCode: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
              event,
              config: this.config
            }
          }
        },
        CONTROL_FRAME_IFRAME
      );

      this.messageBus.subscribeType(PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION_STATUS, (response: unknown) => {
        this.handlePaymentProcessResponse(response.errorCode, response.errorMessage);
        this.gestureHandler();
      });
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
