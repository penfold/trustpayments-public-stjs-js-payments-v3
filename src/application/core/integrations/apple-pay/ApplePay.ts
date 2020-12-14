import { Service } from 'typedi';
import { filter, first, tap } from 'rxjs/operators';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { Payment } from '../../shared/payment/Payment';
import { ApplePayClientStatus } from '../../../../client/integrations/apple-pay/ApplePayClientStatus';
import { APPLE_PAY_BUTTON_ID } from './apple-pay-button-service/ApplePayButtonProperties';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { PAYMENT_ERROR, VALIDATION_ERROR } from '../../models/constants/Translations';
import { IApplePayClientStatus } from '../../../../client/integrations/apple-pay/IApplePayClientStatus';
import { IApplePayPaymentAuthorizationResult } from './IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from './IApplePayPaymentAuthorizedEvent';
import { IApplePayWalletVerifyResponse } from './IApplePayWalletVerifyResponse';
import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';
import { IApplePayValidateMerchantEvent } from './IApplePayValidateMerchantEvent';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ApplePayErrorCodes } from './apple-pay-error-service/ApplePayErrorCodes';
import { ApplePayErrorService } from './apple-pay-error-service/ApplePayErrorService';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { IApplePayConfigObject } from './apple-pay-config-service/IApplePayConfigObject';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePay {
  private applePaySession: any;
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
    private applePaySessionService: ApplePaySessionService
  ) {}

  init(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_CONFIG))
      .pipe(
        tap((event: IMessageBusEvent<IConfig>) => {
          if (!Boolean(ApplePaySession)) {
            console.error('Works only on Safari');
          }

          if (!ApplePaySession.canMakePayments()) {
            console.error('Your device does not support making payments with Apple Pay');
          }

          if (this.applePaySessionService.canMakePaymentsWithActiveCard(event.data.applePay.merchantId)) {
            this.applePayButtonService.insertButton(
              APPLE_PAY_BUTTON_ID,
              event.data.applePay.buttonText,
              event.data.applePay.buttonStyle,
              event.data.applePay.paymentRequest.countryCode
            );
            this.config = this.applePayConfigService.setConfig(event.data, {
              walletmerchantid: '',
              walletrequestdomain: window.location.hostname,
              walletsource: 'APPLEPAY',
              walletvalidationurl: ''
            });
            this.gestureHandler();
          }
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

  private onValidateMerchant(event: IApplePayValidateMerchantEvent) {
    this.config.validateMerchantRequest = this.applePayConfigService.updateWalletValidationUrl(
      this.config.validateMerchantRequest,
      event.validationURL
    );

    const payment = new Payment();

    return payment
      .walletVerify(this.config.validateMerchantRequest)
      .then((response: IApplePayWalletVerifyResponse) => {
        const { requestid, walletsession } = response.response;

        if (this.paymentCancelled) {
          return Promise.reject(requestid);
        }

        if (!walletsession) {
          return Promise.reject(requestid);
        }

        return new Promise((resolve, reject) => {
          try {
            this.applePaySession.completeMerchantValidation(JSON.parse(walletsession));
            resolve(requestid);
          } catch {
            this.onValidateMerchantError();
            reject(requestid);
          }
        });
      })
      .catch(error => {
        console.error('CATCH:', error);
        this.onValidateMerchantError();
        if (this.paymentCancelled) {
          return;
        }
        this.gestureHandler();
      });
  }

  private onValidateMerchantError() {
    this.applePaySessionService.endMerchantValidation();
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status: ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
        data: { errorcode: ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR, errormessage: VALIDATION_ERROR }
      }
    });
  }

  private onPaymentAuthorized(event: IApplePayPaymentAuthorizedEvent): Promise<any> {
    const payment = new Payment();
    this.completeFailedTransaction();
    return payment
      .processPayment(
        this.config.paymentRequest.requestTypes,
        {
          walletsource: this.config.validateMerchantRequest.walletsource,
          wallettoken: JSON.stringify(event.payment)
        },
        {
          ...DomMethods.parseForm(this.config.formId),
          termurl: 'https://termurl.com'
        },
        {
          billingContact: event.payment.billingContact,
          shippingContact: event.payment.shippingContact
        }
      )
      .then((response: IApplePayProcessPaymentResponse) => {
        console.error('THEN:', response);
        this.handlePaymentProcessResponse(response.response.errorcode, response.response.errormessage);
        this.gestureHandler();
      })
      .catch(e => {
        console.error('CATCH:', e);
        this.handlePaymentProcessResponse('1', PAYMENT_ERROR);
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
