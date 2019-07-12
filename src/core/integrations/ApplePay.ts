import StTransport from '../classes/StTransport.class';
import { IWalletConfig } from '../models/Config';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import Payment from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';

const ApplePaySession = (window as any).ApplePaySession;
const ApplePayError = (window as any).ApplePayError;
const ApplePayContactMap: any = {
  countryiso2a: 'countryCode',
  email: 'emailAddress',
  firstname: 'givenName',
  lastname: 'familyName',
  postcode: 'postalCode',
  premise: 'addressLines',
  telephone: 'phoneNumber',
  town: 'locality'
};

interface AppleErrorObject {
  errorcode: number;
  data: any;
}

/**
 * Apple Pay flow:
 * 1. Check if ApplePaySession class exists
 *    (it must be iOS 10 and later and macOS 10.12 and later).
 * 2. Call setApplePayVersion() to set latest available ApplePay version.
 * 3. Call setSupportedNetworks() to set available networks which are supported
 *    in this particular version of Apple Pay.
 * 4. Call setAmountAndCurrency() to set amount and currency hidden in provided JWT.
 * 5. Call createApplePayButton(), setApplePayButtonProps() and addApplePayButton)
 *    to provide styled button for launching Apple Pay Process.
 * 6. Call applePayProcess() which checks by canMakePayments() and canMakePaymentsWithActiveCard(merchantID)
 *    the capability of device for making Apple Pay payments and if there is at least one card in  users Wallet.
 * 7. User taps / clicks ApplePayButton on page and this event triggers applePayButtonClickHandler() -
 *    this is obligatory process -it has to be triggered by users action.
 * 8. Clicking button triggers paymentProcess() which sets ApplePaySession object.
 * 9. Then this.session.begin() is called which begins validating merchant process and display payment sheet.
 * 10. this.onValidateMerchantRequest() - triggers onvalidatemerchant which literally validates merchant.
 * 11. this.subscribeStatusHandlers() - if merchant has been successfully validated, three handlers are set -
 *     onpaymentmethodselected,  onshippingmethodselected, onshippingcontactselected
 *     to handle customer's selections in the payment sheet to complete transaction cost.
 *     We've got 30 seconds to handle each event before the payment sheet times out: completePaymentMethodSelection,
 *     completeShippingMethodSelection, and completeShippingContactSelection
 * 12. Then onPaymentAuthorized() or onPaymentCanceled() has been called which completes payment with
 *     this.session.completePayment function or canceled it with this.session.oncancel handler.
 */
export class ApplePay {
  get applePayButtonProps(): any {
    return this._applePayButtonProps;
  }

  get payment(): Payment {
    return this._payment;
  }

  set payment(value: Payment) {
    this._payment = value;
  }

  set jwt(value: string) {
    this._jwt = value;
  }

  get jwt(): string {
    return this._jwt;
  }

  public static APPLE_PAY_BUTTON_ID: string = 'st-apple-pay';
  public static APPLE_PAY_MIN_VERSION: number = 2;
  public static APPLE_PAY_MAX_VERSION: number = 5;
  public static AVAILABLE_BUTTON_STYLES = ['black', 'white', 'white-outline'];
  public static AVAILABLE_BUTTON_TEXTS = ['plain', 'buy', 'book', 'donate', 'check-out', 'subscribe'];
  public static BASIC_SUPPORTED_NETWORKS = [
    'amex',
    'chinaUnionPay',
    'discover',
    'interac',
    'jcb',
    'masterCard',
    'privateLabel',
    'visa'
  ];
  public static VERSION_3_4_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat([
    'cartesBancaires',
    'eftpos',
    'electron',
    'maestro',
    'vPay'
  ]);
  public static VERSION_5_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat(['elo', 'mada']);

  public applePayVersion: number;
  public buttonStyle: string;
  public buttonText: string;
  public merchantId: string;
  public merchantSession: any;
  public messageBus: MessageBus;
  public paymentDetails: string;
  public paymentRequest: any;
  public placement: string;
  public session: any;
  public sitesecurity: string;
  public stJwtInstance: StJwt;
  public stTransportInstance: StTransport;

  /**
   * All object properties are required for WALLETVERIFY request call to ST.
   */
  public validateMerchantRequestData = {
    walletmerchantid: '',
    walletrequestdomain: window.location.hostname,
    walletsource: 'APPLEPAY',
    walletvalidationurl: ''
  };

  private _jwt: string;
  private _applePayButtonProps: any = {};
  private _payment: Payment;
  private _notification: Notification;
  private requestTypes: string[];
  private _completion: { status: string; errors: [] };
  private _translator: Translator;

  constructor(config: IWalletConfig, jwt: string, gatewayUrl: string) {
    const { sitesecurity, placement, buttonText, buttonStyle, paymentRequest, merchantId, requestTypes } = config;
    this.jwt = jwt;
    this._notification = new Notification();
    this.merchantId = merchantId;
    this.placement = placement;
    this.payment = new Payment(jwt, gatewayUrl);
    this.paymentRequest = paymentRequest;
    this.sitesecurity = sitesecurity;
    this.requestTypes = requestTypes;
    this.validateMerchantRequestData.walletmerchantid = merchantId;
    this.stJwtInstance = new StJwt(jwt);
    this.stTransportInstance = new StTransport({
      gatewayUrl,
      jwt
    });
    this.messageBus = new MessageBus();
    this._translator = new Translator(this.stJwtInstance.locale);
    this.onInit(buttonText, buttonStyle);
  }

  /**
   * Checks if ApplePaySession object is available
   * If yes, returns ApplePaySession object, if not returns undefined.
   */
  public ifApplePayIsAvailable() {
    return !!ApplePaySession;
  }

  /**
   * Checks whether user uses Safari and if it's version supports Apple Pay
   * @param version
   */
  public ifBrowserSupportsApplePayVersion = (version: number) => {
    return ApplePaySession.supportsVersion(version);
  };

  /**
   * Sets the latest possible ApplePay version
   */
  public setApplePayVersion() {
    for (let i = ApplePay.APPLE_PAY_MAX_VERSION; i >= ApplePay.APPLE_PAY_MIN_VERSION; --i) {
      if (this.ifBrowserSupportsApplePayVersion(i)) {
        this.applePayVersion = i;
        return;
      } else if (i === ApplePay.APPLE_PAY_MIN_VERSION) {
        this.applePayVersion = ApplePay.APPLE_PAY_MIN_VERSION;
        return;
      }
    }
  }

  /**
   * Sets supported networks based on version of Apple Pay
   */
  public setSupportedNetworks() {
    if (this.applePayVersion <= ApplePay.APPLE_PAY_MIN_VERSION) {
      this.paymentRequest.supportedNetworks = ApplePay.BASIC_SUPPORTED_NETWORKS;
    } else if (
      this.applePayVersion > ApplePay.APPLE_PAY_MIN_VERSION &&
      this.applePayVersion < ApplePay.APPLE_PAY_MAX_VERSION
    ) {
      this.paymentRequest.supportedNetworks = ApplePay.VERSION_3_4_SUPPORTED_NETWORKS;
    } else {
      this.paymentRequest.supportedNetworks = ApplePay.VERSION_5_SUPPORTED_NETWORKS;
    }
  }

  /**
   * Sets styles and texts provided by Merchant on init
   * @param buttonText
   * @param buttonStyle
   */
  public setApplePayButtonProps(buttonText: string, buttonStyle: string) {
    this.ifApplePayButtonStyleIsValid(buttonStyle)
      ? (this.buttonStyle = buttonStyle)
      : (this.buttonStyle = ApplePay.AVAILABLE_BUTTON_STYLES[0]);
    this.ifApplePayButtonTextIsValid(buttonText)
      ? (this.buttonText = buttonText)
      : (this.buttonText = ApplePay.AVAILABLE_BUTTON_TEXTS[0]);

    // tslint:disable-next-line: max-line-length
    this._applePayButtonProps.style = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: ${
      this.buttonText
    }; -apple-pay-button-style: ${this.buttonStyle}`;
  }

  /**
   * Creates Apple Pay button with props specified by Merchant (buttonText, buttonStyle)
   */
  public createApplePayButton() {
    return DomMethods.createHtmlElement.apply(this, [this._applePayButtonProps, 'div']);
  }

  /**
   * Adds Apple Pay button to DOM
   */
  public addApplePayButton = () => DomMethods.appendChildIntoDOM(this.placement, this.createApplePayButton());

  /**
   * Checks if provided button text is one of the available for Apple Pay
   * @param buttonText
   */
  public ifApplePayButtonTextIsValid = (buttonText: string) => ApplePay.AVAILABLE_BUTTON_TEXTS.includes(buttonText);

  /**
   * Checks if provided button style is one of the available for Apple Pay
   * @param buttonStyle
   */
  public ifApplePayButtonStyleIsValid = (buttonStyle: string) => ApplePay.AVAILABLE_BUTTON_STYLES.includes(buttonStyle);

  /**
   * Simple handler for generated Apple Pay button.
   * It's obligatory due to ApplePay requirements -
   * this action needs to be triggered by user himself by tapping/clicking button 'Pay'
   * @param elementId
   * @param event
   */
  public applePayButtonClickHandler = (elementId: string, event: string) => {
    document.getElementById(elementId).addEventListener(event, () => {
      this.paymentProcess();
    });
  };

  /**
   * Checks whether ApplePay is available on current device
   */
  public checkApplePayAvailability() {
    return ApplePaySession && ApplePaySession.canMakePayments();
  }

  /**
   * Checks whether ApplePay is available on current device and also if it us at least one active card in Wallet
   */
  public checkApplePayWalletCardAvailability() {
    return ApplePaySession.canMakePaymentsWithActiveCard(this.merchantId);
  }

  /**
   * Gets Apple Pay session object based on Apple Pay version number and ApplePayPaymentRequest
   */
  public getApplePaySessionObject() {
    return new ApplePaySession(this.applePayVersion, this.paymentRequest);
  }

  /**
   * Sets details encrypted in JWT into payment request
   */
  public setAmountAndCurrency() {
    if (this.paymentRequest.total.amount && this.paymentRequest.currencyCode) {
      this.paymentRequest.total.amount = this.stJwtInstance.mainamount;
      this.paymentRequest.currencyCode = this.stJwtInstance.currencyiso3a;
    } else {
      this._notification.error(Language.translations.APPLE_PAY_AMOUNT_AND_CURRENCY, true);
    }
    return this.paymentRequest;
  }

  /**
   * Method which initializes:
   *  1. All settings for ApplePay flow being launched.
   *  2. apple pay process which is called here apple pay flow
   * @param buttonText
   * @param buttonStyle
   * @private
   */
  public onInit(buttonText: string, buttonStyle: string) {
    if (this.ifApplePayIsAvailable()) {
      this.setApplePayVersion();
      this.setSupportedNetworks();
      this.setAmountAndCurrency();
      this.setApplePayButtonProps(buttonText, buttonStyle);
      this.addApplePayButton();
      this.applePayProcess();
    }
  }

  /**
   * Make a server-to-server call to pass a payload to the
   * Apple Pay validationURL endpoint.
   *
   * If successful, Apple Pay servers will return a merchant session object
   * which will be used in response to completeMerchantValidation
   */
  public onValidateMerchantRequest() {
    this.session.onvalidatemerchant = (event: any) => {
      this.validateMerchantRequestData.walletvalidationurl = event.validationURL;
      return this.payment
        .walletVerify(this.validateMerchantRequestData)
        .then((result: any) => {
          this.onValidateMerchantResponseSuccess(result.response);
        })
        .catch(error => {
          const { errorcode, errormessage } = error;
          this.onValidateMerchantResponseFailure(error);
          this._notification.error(`${errorcode}: ${errormessage}`, true);
        });
    };
  }

  public getPaymentSuccessStatus() {
    return ApplePaySession.STATUS_SUCCESS;
  }

  public getPaymentFailureStatus() {
    return ApplePaySession.STATUS_FAILURE;
  }

  /**
   * Handles onpaymentauthorized event and completes payment
   */
  public onPaymentAuthorized() {
    this.session.onpaymentauthorized = (event: any) => {
      this.paymentDetails = JSON.stringify(event.payment);
      return this.payment
        .processPayment(
          this.requestTypes,
          {
            walletsource: this.validateMerchantRequestData.walletsource,
            wallettoken: this.paymentDetails
          },
          DomMethods.parseMerchantForm()
        )
        .then(() => {
          this._completion = { status: this.getPaymentSuccessStatus(), errors: [] };
          this._notification.success(Language.translations.PAYMENT_SUCCESS, true);
          this.session.completePayment(this._completion);
        })
        .catch((error: any) => {
          this._completion = { status: this.getPaymentFailureStatus(), errors: [] };
          this._notification.error(Language.translations.PAYMENT_ERROR, true);
          this._handleApplePayError(error);
          this.session.completePayment();
        });
    };
  }

  /**
   * Handles oncancel event and set notification about it
   */
  public onPaymentCanceled() {
    this.session.oncancel = (event: any) => {
      this._notification.warning(Language.translations.PAYMENT_CANCELLED, true);
    };
  }

  /**
   * Handles merchant validation success response
   * @param response
   */
  public onValidateMerchantResponseSuccess(response: any) {
    if (response.walletsession) {
      this.merchantSession = JSON.parse(response.walletsession);
      this.validateMerchantRequestData.walletmerchantid = this.merchantSession.merchantIdentifier;
      this.session.completeMerchantValidation(this.merchantSession);
    } else {
      this.onValidateMerchantResponseFailure(response.requestid);
    }
  }

  /**
   * Handles merchant validation error response
   * @param error
   */
  public onValidateMerchantResponseFailure(error: any) {
    this.session.abort();
    this._notification.error(Language.translations.MERCHANT_VALIDATION_FAILURE, true);
  }

  /**
   * Sets payment sheet interactions handlers: onpaymentmethodselected,
   * onshippingmethodselected, onshippingcontactselected
   */
  public subscribeStatusHandlers() {
    this.session.onpaymentmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this.session.completePaymentMethodSelection({
        // what is type ??
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: 'final'
        }
      });
    };

    this.session.onshippingmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this.session.completeShippingMethodSelection({
        newTotal: { label: this.paymentRequest.total.label, amount: this.paymentRequest.total.amount, type: 'final' }
      });
    };

    this.session.onshippingcontactselected = (event: any) => {
      const { shippingContact } = event;
      this.session.completeShippingContactSelection({
        newTotal: { label: this.paymentRequest.total.label, amount: this.paymentRequest.total.amount, type: 'final' }
      });
    };
  }

  /**
   * Begins Apple Pay payment flow.
   */
  public paymentProcess() {
    this.session = this.getApplePaySessionObject();
    this.onValidateMerchantRequest();
    this.subscribeStatusHandlers();
    this.onPaymentAuthorized();
    this.onPaymentCanceled();
    this.session.begin();
  }

  /**
   * Sets Apple Pay button and begins Apple Pay flow.
   */
  public applePayProcess() {
    if (this.checkApplePayAvailability()) {
      this.checkApplePayWalletCardAvailability().then((canMakePayments: boolean) => {
        if (canMakePayments) {
          this.applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');
        }
      });
    }
  }

  /**
   * Handles errors during ApplePay process.
   * @param errorObject
   * @private
   */
  private _handleApplePayError(errorObject: AppleErrorObject) {
    let { errorcode } = errorObject;
    let errordata = String(errorObject.data);
    let error = new ApplePayError('unknown');
    error.message = this._translator.translate(error.message);
    if (errorcode !== 0) {
      if (errorcode === 30000) {
        if (errordata.lastIndexOf('billing', 0) === 0) {
          error.code = 'billingContactInvalid';
          errordata = errordata.slice(7);
        } else if (errordata.lastIndexOf('customer', 0) === 0) {
          error.code = 'shippingContactInvalid';
          errordata = errordata.slice(8);
        }
        if (typeof ApplePayContactMap[errordata] !== 'undefined') {
          error.contactField = ApplePayContactMap[errordata];
        } else if (error.code !== 'unknown') {
          error.code = 'addressUnserviceable';
        }
      }
      if (error.code !== 'unknown') {
        // @ts-ignore
        this._completion.errors = [error];
      }
    }
    return this._completion;
  }
}

export default ApplePay;
