import { Service } from 'typedi';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { ApplePayClientStatus } from '../../../../client/integrations/apple-pay/ApplePayClientStatus';
import { APPLE_PAY_BUTTON_ID } from './apple-pay-button-service/ApplePayButtonProperties';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { VALIDATION_ERROR } from '../../models/constants/Translations';
import { IApplePayClientStatus } from '../../../../client/integrations/apple-pay/IApplePayClientStatus';
import { IApplePayPaymentAuthorizationResult } from './IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from './IApplePayPaymentAuthorizedEvent';
import { IApplePayValidateMerchantEvent } from './IApplePayValidateMerchantEvent';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ApplePayErrorCodes } from './apple-pay-error-service/ApplePayErrorCodes';
import { ApplePayErrorService } from './apple-pay-error-service/ApplePayErrorService';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { IApplePayConfigObject } from './apple-pay-config-service/IApplePayConfigObject';
import { ApplePayPaymentService } from './apple-pay-payment-service/ApplePayPaymentService';
import { from, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { IApplePaySession } from './apple-pay-session-service/IApplePaySession';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePay {
  private applePaySession: IApplePaySession;
  private readonly completion: IApplePayPaymentAuthorizationResult = {
    errors: undefined,
    status: undefined
  };
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
    private applePayPaymentService: ApplePayPaymentService
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
        filter((v: any) => v.status),
        switchMap((v: any) => {
          return from(this.applePaySessionService.canMakePaymentsWithActiveCard(v.config.applePay.merchantId)).pipe(
            filter((canMakePayment: boolean) => canMakePayment),
            map((canMakePayment: boolean) => {
              console.error('dupa');
              if (canMakePayment) {
                this.applePayButtonService.insertButton(
                  APPLE_PAY_BUTTON_ID,
                  v.config.applePay.buttonText,
                  v.config.applePay.buttonStyle,
                  v.config.applePay.paymentRequest.countryCode
                );
                this.config = this.applePayConfigService.setConfig(v.config, {
                  walletmerchantid: '',
                  walletrequestdomain: window.location.hostname,
                  walletsource: 'APPLEPAY',
                  walletvalidationurl: ''
                });
                this.gestureHandler();
                return of(ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD);
              }
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

    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      console.error('onvalidatemerchant', event);
      this.onValidateMerchant(event);
    };

    this.applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      console.error('onpaymentauthorized', event);
      this.onPaymentAuthorized(event);
    };

    this.applePaySession.oncancel = (event: Event) => {
      console.error('cancel', event);
      this.gestureHandler();
      this.paymentCancelled = true;
      this.onCancel();
    };
  }

  private onValidateMerchant(event: IApplePayValidateMerchantEvent): void {
    this.applePayPaymentService
      .walletVerify(
        this.config.validateMerchantRequest,
        event.validationURL,
        this.paymentCancelled,
        this.applePaySession
      )
      .pipe(
        switchMap((code: ApplePayErrorCodes) => {
          if (code !== ApplePayErrorCodes.VALIDATE_MERCHANT_SUCCESS) {
            this.applePaySessionService.endMerchantValidation();
            this.handleWalletVerifyResponse(
              ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
              ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR,
              VALIDATION_ERROR
            );
          }
          this.handleWalletVerifyResponse(
            ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS,
            ApplePayErrorCodes.VALIDATE_MERCHANT_SUCCESS,
            'Merchant validation success'
          );
          return of(code);
        })
      )
      .subscribe();
  }

  private handleWalletVerifyResponse(status: ApplePayClientStatus, code: ApplePayErrorCodes, message: string) {
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status,
        data: { errorcode: code, errormessage: message }
      }
    });
  }

  private onPaymentAuthorized(event: IApplePayPaymentAuthorizedEvent): void {
    this.completeFailedTransaction();
    console.error(event);
    this.applePayPaymentService
      .processPayment(
        this.config.paymentRequest.requestTypes,
        this.config.validateMerchantRequest,
        this.config.formId,
        event
      )
      .subscribe((response: any) => {
        this.handlePaymentProcessResponse(response.errorcode, response.errormessage);
        this.gestureHandler();
      });
  }

  private onCancel() {
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status: ApplePayClientStatus.CANCEL,
        data: {
          errorcode: ApplePayErrorCodes.CANCEL,
          errormessage: 'Payment has been cancelled'
        }
      }
    });
  }

  private handlePaymentProcessResponse(errorcode: string, errormessage: string): IApplePayPaymentAuthorizationResult {
    console.error('errorcode:', errorcode, 'errormessage:', errormessage);
    if (Number(errorcode) === ApplePayErrorCodes.SUCCESS) {
      this.completion.status = ApplePaySession.STATUS_SUCCESS;
      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.SUCCESS,
          data: {
            errorcode: ApplePayErrorCodes.SUCCESS,
            errormessage
          }
        }
      });
      console.error(this.completion);
      this.applePaySession.completePayment(this.completion);
      return this.completion;
    }
    this.completion.errors = this.applePayErrorService.create('unknown', this.config.locale);
    this.completion.status = ApplePaySession.STATUS_FAILURE;

    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status: ApplePayClientStatus.ERROR,
        data: {
          errorcode: ApplePayErrorCodes.ERROR,
          errormessage
        }
      }
    });
    this.applePaySession.completePayment(this.completion);
    return this.completion;
  }

  private completeFailedTransaction(): void {
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
            errors: this.applePayErrorService.create(event.data.errormessage, this.config.locale)
          });
        }
      });
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
