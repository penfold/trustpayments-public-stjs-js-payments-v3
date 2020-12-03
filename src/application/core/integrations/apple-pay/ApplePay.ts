import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Payment } from '../../shared/payment/Payment';
import { Translator } from '../../shared/translator/Translator';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { Observable, Subscriber } from 'rxjs';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { MERCHANT_VALIDATION_FAILURE, PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { IApplePayValidateMerchantRequest } from './IApplePayValidateMerchantRequest';
import { IApplePayPaymentRequest } from './IApplePayPaymentRequest';
import { IApplePayValidateMerchantEvent } from './IApplePayValidateMerchantEvent';
import { IApplePayPaymentMethod } from './IApplePayPaymentMethod';
import { IApplePayPaymentContact } from './IApplePayPaymentContact';
import { IApplePayShippingMethod } from './IApplePayShippingMethod';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayNetworksService } from './apple-pay-networks-service/ApplePayNetworksService';
import { IApplePayPaymentAuthorizationResult } from './IApplePayPaymentAuthorizationResult ';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IApplePay } from './IApplePay';
import { APPLE_PAY_BUTTON_ID } from './ApplePayButtonProperties';
import { IApplePayClientStatus } from '../../../../client/integrations/apple-pay/IApplePayClientStatus';
import { ApplePayClientStatus } from '../../../../client/integrations/apple-pay/ApplePayClientStatus';
import { IApplePayCancelEvent } from '../../../../client/integrations/apple-pay/IApplePayCancelEvent';
import { IApplePayPaymentAuthorizedEvent } from './IApplePayPaymentAuthorizedEvent';
import { IApplePayWalletVerifyResponse } from './IApplePayWalletVerifyResponse';
import { IApplePayBillingContact } from './IApplePayBillingContact';
import { IApplePayShippingContact } from './IApplePayShippingContact';

const ApplePaySession = (window as any).ApplePaySession;
const ApplePayError = (window as any).ApplePayError;

export class ApplePay {
  private _applePaySession: any;
  private _validateMerchantRequest: IApplePayValidateMerchantRequest = {
    walletmerchantid: '',
    walletrequestdomain: window.location.hostname,
    walletsource: 'APPLEPAY',
    walletvalidationurl: ''
  };
  private _applePayVersion: number;
  private _payment: Payment;
  private _translator: Translator;
  private _paymentRequest: IApplePayPaymentRequest;
  private _formId: string;
  private readonly _completion: IApplePayPaymentAuthorizationResult = {
    errors: [],
    status: ''
  };
  private _paymentCancelled: boolean = false;

  constructor(
    private _communicator: InterFrameCommunicator,
    private _configProvider: ConfigProvider,
    private _localStorage: BrowserLocalStorage,
    private _messageBus: MessageBus,
    private _notification: NotificationService,
    private _applePayButtonService: ApplePayButtonService,
    private _applePayNetworkService: ApplePayNetworksService,
    private _applePayConfigService: ApplePayConfigService
  ) {}

  // if (canMakePayments) {
  // GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments');
  // this._applePayButtonService.insertButton(
  //   APPLE_PAY_BUTTON_ID,
  //   config.buttonText,
  //   config.buttonStyle,
  //   config.paymentRequest.countryCode
  // );
  // this.gestureHandler()
  // } else {
  // GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay cannot make payments');
  // throw new Error('User has not an active card provisioned into Wallet');
  // }
  // })
  // .catch(() => {
  //   console.error('can make payments dupa');
  //   this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
  //   this._notification.error(APPLE_PAY_NOT_LOGGED);
  // });

  private proceedPayment(observer: any): void {
    this._paymentCancelled = false;
    this._applePaySession = new ApplePaySession(this._applePayVersion, this._paymentRequest);
    this.onValidateMerchant(observer);
    this.onPaymentMethodSelected();
    this.onShippingMethodSelected();
    this.onShippingContactSelected();
    this.onPaymentAuthorized(observer);
    this.onCancel(observer);
    this.beginMerchantValidation();
  }

  private onValidateMerchant(observer: Subscriber<IApplePayClientStatus>) {
    this._applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      this._validateMerchantRequest = this._applePayConfigService.updateWalletValidationUrl(
        this._validateMerchantRequest,
        event.validationURL
      );

      return this._payment
        .walletVerify(this._validateMerchantRequest)
        .then((response: IApplePayWalletVerifyResponse) => {
          console.error('walletverify:', response.response);
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
          const { requestid, walletsession } = response.response;
          if (this._paymentCancelled) {
            return Promise.reject(requestid);
          }
          return new Promise((resolve, reject) => {
            if (walletsession) {
              try {
                this._applePaySession.completeMerchantValidation(JSON.parse(walletsession));
                resolve(undefined);
              } catch (error) {
                console.warn(error);
                try {
                  this._applePaySession.abort();
                } catch (error) {
                  console.warn(error);
                }
                this._notification.error(MERCHANT_VALIDATION_FAILURE);
                reject(requestid);
              }
            } else {
              reject(requestid);
            }
          });
        })
        .catch(error => {
          console.error('on validate merchat ', event);
          if (this._paymentCancelled) {
            return;
          }
          const { errorcode, errormessage } = error;
          try {
            this._applePaySession.abort();
          } catch (error) {
            console.warn(error);
          }
          this._notification.error(MERCHANT_VALIDATION_FAILURE);
          this.gestureHandler(observer);
          this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
          this._notification.error(`${errorcode}: ${errormessage}`);
          GoogleAnalytics.sendGaData(
            'event',
            'Apple Pay',
            'merchant validation',
            'Apple Pay merchant validation failure'
          );
        });
    };
  }

  private onPaymentAuthorized(observer: Subscriber<IApplePayClientStatus>): void {
    this._applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      const wallettoken: string = JSON.stringify(event.payment.token);
      const parsedForm: {} = DomMethods.parseForm(this._formId);
      const paymentData: { walletsource: string; wallettoken: string } = {
        walletsource: this._validateMerchantRequest.walletsource,
        wallettoken
      };
      const billingAndShippingData: {
        billingContact: IApplePayBillingContact;
        shippingContact: IApplePayShippingContact;
      } = {
        billingContact: event.payment.billingContact,
        shippingContact: event.payment.shippingContact
      };
      return this._payment
        .processPayment(this._paymentRequest.requestTypes, paymentData, parsedForm, billingAndShippingData)
        .then((response: any) => {
          console.error('processPayment', response);
          const { errorcode, errormessage } = response.response;
          this.onError(errorcode, errormessage, response.response.data);
          this._applePaySession.completePayment(this._completion);
          observer.next({
            status: ApplePayClientStatus.SUCCESS,
            data: { errorcode, errormessage }
          });
        })
        .catch(e => {
          console.error('process payment error', event);
          this._notification.error(PAYMENT_ERROR);
          this._applePaySession.completePayment({ status: ApplePaySession.STATUS_FAILURE, errors: [] });
          this.gestureHandler(observer);
          this._localStorage.setItem('completePayment', 'true');
        });
    };
  }

  private onError(errorcode: string, errormessage: string, data: any): IApplePayPaymentAuthorizationResult {
    console.error('Error Object: ', errorcode, errormessage, data);

    this._completion.errors.push(errorcode);

    if (!this.getLatestSupportedApplePayVersion()) {
      this._completion.status = ApplePaySession.STATUS_FAILURE;
      return this._completion;
    }

    if (errorcode === '0') {
      this._completion.status = ApplePaySession.STATUS_SUCCESS;
      return this._completion;
    }

    const errordata = String(data);
    const error = new ApplePayError('unknown');
    error.message = this._translator.translate(errormessage);
    this._completion.status = ApplePaySession.STATUS_FAILURE;
    this._localStorage.setItem('completePayment', 'false');

    if (errordata.lastIndexOf('billing', 0) === 0) {
      error.code = 'billingContactInvalid';
    }

    if (errordata.lastIndexOf('customer', 0) === 0) {
      error.code = 'shippingContactInvalid';
    }
    this.gestureHandler();
    this._completion.errors.push(error.code);
    return this._completion;
  }

  private setValidateMerchantRequest(applePay: IApplePay): IApplePayValidateMerchantRequest {
    return this._applePayConfigService.updateWalletMerchantId(this._validateMerchantRequest, applePay.merchantId);
  }

  private setPaymentRequest(applePay: IApplePay, jwt: string) {
    const { currencyiso3a, mainamount } = this._applePayConfigService.getStJwtData(jwt);
    return this._applePayConfigService.updatePaymentRequest(
      applePay,
      jwt,
      currencyiso3a,
      mainamount,
      this._applePayVersion
    );
  }

  private setInstances(formId: string, locale: string): void {
    this._translator = new Translator(locale);
    this._payment = new Payment();
    this._formId = formId;
  }

  private getLatestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();
    return versions.find((version: number) => {
      return ApplePaySession.supportsVersion(version);
    });
  }

  private onPaymentMethodSelected(): void {
    this._applePaySession.onpaymentmethodselected = (event: IApplePayPaymentMethod) => {
      console.error('onpaymentmethodselected', event);
      this._applePaySession.completePaymentMethodSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private onShippingMethodSelected(): void {
    this._applePaySession.onshippingmethodselected = (event: IApplePayShippingMethod) => {
      console.error('onshippingmethodselected', event);
      this._applePaySession.completeShippingMethodSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private onShippingContactSelected(): void {
    this._applePaySession.onshippingcontactselected = (event: IApplePayPaymentContact) => {
      console.error('onshippingcontactselected', event);
      this._applePaySession.completeShippingContactSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private gestureHandler(observer?: any): void {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);
    const handler = () => {
      this.proceedPayment(observer);
      button.removeEventListener('click', handler);
    };
    if (button) {
      button.addEventListener('click', handler);
    }
  }

  private beginMerchantValidation(): void {
    try {
      this._applePaySession.begin();
    } catch (error) {
      console.warn(error);
    }
  }

  private canMakePaymentsWithActiveCard(merchantId: string): boolean {
    return ApplePaySession.canMakePaymentsWithActiveCard(merchantId).then(
      (canMakePayments: boolean) => canMakePayments
    );
  }

  private onCancel(observer: Subscriber<IApplePayClientStatus>): void {
    this._applePaySession.oncancel = (event: IApplePayCancelEvent) => {
      console.error('CANCEL EVENT:', event);
      this.gestureHandler(observer);
      observer.next({
        status: ApplePayClientStatus.CANCEL,
        data: { errorcode: event.type, errormessage: 'Payment has been cancelled' }
      });
      this._paymentCancelled = true;
    };
  }

  init(): void {
    this._communicator.whenReceive(PUBLIC_EVENTS.APPLE_PAY_START).thenRespond((event: IMessageBusEvent<IConfig>) => {
      console.error(event, 'APPLE PAY CONFIG');

      if (!Boolean(ApplePaySession)) {
        console.error('Works only on Safari');
      }

      if (!ApplePaySession.canMakePayments()) {
        console.error('Your device does not support making payments with Apple Pay');
      }

      const { data } = event;
      const { applePay, formId, jwt } = this._applePayConfigService.getConfigData(data);
      const { locale } = this._applePayConfigService.getStJwtData(jwt);
      this._applePayVersion = this.getLatestSupportedApplePayVersion();
      this._validateMerchantRequest = this.setValidateMerchantRequest(applePay);
      this._paymentRequest = this.setPaymentRequest(applePay, jwt);
      this.setInstances(formId, locale);

      return new Observable<IApplePayClientStatus>((observer: Subscriber<IApplePayClientStatus>) => {
        if (this.canMakePaymentsWithActiveCard(applePay.merchantId)) {
          this._applePayButtonService.insertButton(
            APPLE_PAY_BUTTON_ID,
            event.data.applePay.buttonText,
            event.data.applePay.buttonStyle,
            event.data.applePay.paymentRequest.countryCode
          );
          this.gestureHandler(observer);
        }
      });
    });
  }
}
