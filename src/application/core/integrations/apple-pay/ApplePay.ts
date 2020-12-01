import jwt_decode from 'jwt-decode';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Payment } from '../../shared/payment/Payment';
import { Translator } from '../../shared/translator/Translator';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { Observable } from 'rxjs';
import { IConfig } from '../../../../shared/model/config/IConfig';
import {
  APPLE_PAY_NOT_LOGGED,
  MERCHANT_VALIDATION_FAILURE,
  PAYMENT_CANCELLED,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS
} from '../../models/constants/Translations';
import { IApplePayValidateMerchantRequest } from './IApplePayValidateMerchantRequest';
import { IApplePayPaymentRequest } from './IApplePayPaymentRequest';
import { IApplePayValidateMerchantEvent } from './IApplePayValidateMerchantEvent';
import { IApplePayPaymentMethod } from './IApplePayPaymentMethod';
import { IApplePayPaymentContact } from './IApplePayPaymentContact';
import { IApplePayShippingMethod } from './IApplePayShippingMethod';
import { IApplePayPayment } from './IApplePayPayment';
import { IDecodedJwt } from '../../models/IDecodedJwt';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayNetworksService } from './apple-pay-networks-service/ApplePayNetworksService';
import { IApplePayPaymentAuthorizationResult } from './IApplePayPaymentAuthorizationResult ';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';

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
  private readonly _config$: Observable<IConfig>;
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
  ) {
    if (!Boolean(ApplePaySession)) {
      throw new Error('Works only on Safari');
    }

    if (!ApplePaySession.canMakePayments()) {
      throw new Error('Your device does not support making payments with Apple Pay');
    }

    this._config$ = this._configProvider.getConfig$();
  }

  public init(): void {
    this._config$.subscribe((config: IConfig) => {
      if (!config.applePay) {
        throw new Error('There is no config for Apple Pay.');
      }
      const { applePay, formId, jwt } = this._applePayConfigService.getConfigData(config);
      const { currencyiso3a, locale, mainamount } = this._applePayConfigService.getStJwtData(jwt);
      this._paymentRequest = applePay.paymentRequest;
      this._applePayVersion = this._latestSupportedApplePayVersion();
      this._validateMerchantRequest = this._applePayConfigService.updateWalletMerchantId(
        this._validateMerchantRequest,
        applePay.merchantId
      );
      this._paymentRequest.supportedNetworks = this._applePayNetworkService.setSupportedNetworks(
        this._applePayVersion,
        this._paymentRequest.supportedNetworks
      );
      this._paymentRequest = this._applePayConfigService.updateAmount(this._paymentRequest, mainamount);
      this._paymentRequest = this._applePayConfigService.updateCurrencyCode(this._paymentRequest, currencyiso3a);
      this._paymentRequest = this._applePayConfigService.updateRequestTypes(
        this._paymentRequest,
        jwt_decode<IDecodedJwt>(jwt).payload.requesttypedescriptions
      );

      this._translator = new Translator(locale);
      this._payment = new Payment();
      this._formId = formId;
      this._applePayButtonService.insertButton(applePay.placement, applePay.buttonText, applePay.buttonStyle, locale);
      this._hasActiveCards(applePay.merchantId);
    });
    this._subscribeUpdateJwt();
  }

  private _subscribeUpdateJwt(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { currencyiso3a, locale, mainamount } = this._applePayConfigService.getStJwtData(data.newJwt);
      this._translator = new Translator(locale);
      this._paymentRequest = this._applePayConfigService.updateCurrencyCode(this._paymentRequest, currencyiso3a);
      this._paymentRequest = this._applePayConfigService.updateAmount(this._paymentRequest, mainamount);
    });
  }

  private _onValidateMerchant() {
    this._applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      this._validateMerchantRequest = this._applePayConfigService.updateWalletValidationUrl(
        this._validateMerchantRequest,
        event.validationURL
      );
      return this._payment
        .walletVerify(this._validateMerchantRequest)
        .then(({ response }: any) => {
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
          return this._onValidateMerchantResponseSuccess(response);
        })
        .catch(error => {
          if (this._paymentCancelled) {
            return;
          }
          const { errorcode, errormessage } = error;
          this._onValidateMerchantResponseFailure(error);
          this._applePayButtonService.handleEvent(this._proceedPayment, 'click');
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

  private _onPaymentAuthorized() {
    this._applePaySession.onpaymentauthorized = (event: IApplePayPayment) => {
      return this._payment
        .processPayment(
          this._paymentRequest.requestTypes,
          {
            walletsource: this._validateMerchantRequest.walletsource,
            wallettoken: JSON.stringify(event.payment.token)
          },
          DomMethods.parseForm(this._formId),
          {
            billingContact: event.payment.billingContact,
            shippingContact: event.payment.shippingContact
          }
        )
        .then((response: any) => {
          const { errorcode, errormessage } = response.response;
          this._onError(errorcode, errormessage, response.response.data);
          this._applePaySession.completePayment(this._completion);
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
          this._localStorage.setItem('completePayment', 'true');
          this._displayNotification(errorcode, errormessage);
        })
        .catch(() => {
          this._notification.error(PAYMENT_ERROR);
          this._applePaySession.completePayment({ status: ApplePaySession.STATUS_FAILURE, errors: [] });
          this._applePayButtonService.handleEvent(this._proceedPayment, 'click');
          this._localStorage.setItem('completePayment', 'true');
        });
    };
  }

  private _latestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();
    return versions.find((version: number) => {
      return ApplePaySession.supportsVersion(version);
    });
  }

  private _onCancel(): void {
    this._applePaySession.oncancel = (event: any) => {
      this._paymentCancelled = true;
      console.error(this._notification);
      this._notification.cancel(PAYMENT_CANCELLED);
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
      this._messageBus.publish(
        { type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, data: { errorcode: event } },
        true
      );
      this._applePayButtonService.handleEvent(this._proceedPayment, 'click');
      GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');
    };
  }

  private _onValidateMerchantResponseSuccess(response: any): Promise<any> {
    const { requestid, walletsession } = response;
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
          this._onValidateMerchantResponseFailure(requestid);
          reject(requestid);
        }
      } else {
        reject(requestid);
      }
    });
  }

  private _onValidateMerchantResponseFailure(error: any) {
    try {
      this._applePaySession.abort();
    } catch (error) {
      console.warn(error);
    }
    this._notification.error(MERCHANT_VALIDATION_FAILURE);
  }

  private _onPaymentMethodSelected(): void {
    this._applePaySession.onpaymentmethodselected = (event: IApplePayPaymentMethod) => {
      const { paymentMethod } = event;
      this._applePaySession.completePaymentMethodSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private _onShippingMethodSelected(): void {
    this._applePaySession.onshippingmethodselected = (event: IApplePayShippingMethod) => {
      this._applePaySession.completeShippingMethodSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private _onShippingContactSelected(): void {
    this._applePaySession.onshippingcontactselected = (event: IApplePayPaymentContact) => {
      this._applePaySession.completeShippingContactSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private _proceedPayment(): void {
    this._paymentCancelled = false;
    // must be here (gesture handl.)
    this._applePaySession = new ApplePaySession(this._applePayVersion, this._paymentRequest);
    this._onValidateMerchant();
    this._onPaymentMethodSelected();
    this._onShippingMethodSelected();
    this._onShippingContactSelected();
    this._onPaymentAuthorized();
    this._onCancel();
    try {
      this._applePaySession.begin();
    } catch (error) {
      console.warn(error);
    }
  }

  private _hasActiveCards(merchantId: string): void {
    ApplePaySession.canMakePaymentsWithActiveCard(merchantId)
      .then((canMakePayments: boolean) => {
        if (canMakePayments) {
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments');
          this._applePayButtonService.handleEvent(this._proceedPayment, 'click');
        } else {
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay cannot make payments');
          throw new Error('User has not an active card provisioned into Wallet');
        }
      })
      .catch(() => {
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(APPLE_PAY_NOT_LOGGED);
      });
  }

  private _onError(errorcode: string, errormessage: string, data: any): IApplePayPaymentAuthorizationResult {
    console.error('Error Object: ', errorcode, errormessage, data);

    this._completion.errors.push(errorcode);

    if (!this._latestSupportedApplePayVersion()) {
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
    this._applePayButtonService.handleEvent(this._proceedPayment, 'click');
    this._completion.errors.push(error.code);
    return this._completion;
  }

  private _displayNotification(errorcode: string, errormessage: string): void {
    if (errorcode === '0') {
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
      this._notification.success(PAYMENT_SUCCESS);
      return;
    }
    this._notification.error(errormessage);
  }
}
