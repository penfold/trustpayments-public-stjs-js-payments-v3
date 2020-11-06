import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Payment } from '../../shared/payment/Payment';
import { StJwt } from '../../shared/stjwt/StJwt';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { Observable } from 'rxjs';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { PAYMENT_CANCELLED, PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../models/constants/Translations';
import JwtDecode from 'jwt-decode';
import { IDecodedJwt } from '../../models/IDecodedJwt';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { VisaResponseTypes } from '../../models/constants/visa-checkout/VisaResponseTypes';
import { VisaButtonProps } from '../../models/constants/visa-checkout/VisaButtonProps';
import { IVisaInit } from '../../models/visa-checkout/IVisaInit';
import { Apm } from '../Apm';
import { IUpdateJwt } from '../../models/IUpdateJwt';
import { Service } from 'typedi';

declare const V: any;

@Service()
export class VisaCheckout extends Apm {
  private _config$: Observable<IConfig>;
  private _formId: string;
  private _jwt: string;
  private _payment: Payment;
  private _stJwt: StJwt;
  private _visaConfig: IConfig;
  private _visaInit: IVisaInit;
  private _urls = {
    buttonUrl: '',
    sdkUrl: ''
  };

  constructor(
    private _configProvider: ConfigProvider,
    private _communicator: InterFrameCommunicator,
    private _messageBus: MessageBus,
    private _notification: NotificationService
  ) {
    super();
    this.init();
    this.updateJwtListener();
  }

  init(): void {
    this._config$ = this._configProvider.getConfig$();
    this._communicator.whenReceive(MessageBus.EVENTS_PUBLIC.CONFIG_CHECK).thenRespond(() => this._config$);
    this._config$.subscribe((config: IConfig) => {
      this._updatePaymentAndStJwt(config);
      this._setInitObject(config);
      this._customizeButton();
      this._loadSdk(this._visaConfig.visaCheckout.placement);
    });
  }

  updateJwtListener(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (response: IUpdateJwt) => {
      this._updatePaymentAndStJwt(this._visaConfig, response.newJwt);
      this._updateInitObject();
      this._customizeButton();
    });
  }

  private _loadSdk(target: string): void {
    DomMethods.insertScript(target, { src: this._urls.sdkUrl, id: 'visaCheckout' })
      .then(() => {
        this._injectButton(target);
        this._setHandlers();
      })
      .catch((e: any) => {
        throw new Error(e);
      });
  }

  private _updatePaymentAndStJwt(config: IConfig, newJwt?: string): void {
    this._jwt = newJwt ? newJwt : config.jwt;
    this._formId = config.formId;
    this._stJwt = new StJwt(this._jwt);
    this._payment = new Payment();
  }

  private _updateInitObject(): void {
    const { currencyiso3a, mainamount, locale } = this._stJwt;
    this._visaInit.paymentRequest.currencyCode = currencyiso3a;
    this._visaInit.paymentRequest.subtotal = mainamount;
    this._visaInit.paymentRequest.total = mainamount;
    this._visaInit.settings.locale = locale;
  }

  private _setInitObject(config: IConfig): void {
    this._visaConfig = config;
    this._urls = {
      buttonUrl: this._visaConfig.livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL : VisaButtonProps.src,
      sdkUrl: this._visaConfig.livestatus
        ? environment.VISA_CHECKOUT_URLS.LIVE_SDK
        : environment.VISA_CHECKOUT_URLS.TEST_SDK
    };
    this._visaInit = {
      apikey: this._visaConfig.visaCheckout.merchantId,
      encryptionKey: this._visaConfig.visaCheckout.encryptionKey,
      paymentRequest: {
        currencyCode: this._stJwt.currencyiso3a,
        subtotal: this._stJwt.mainamount,
        total: this._stJwt.mainamount,
        ...this._visaConfig.visaCheckout.paymentRequest
      },
      settings: {
        locale: this._stJwt.locale,
        ...this._visaConfig.visaCheckout.settings
      }
    };
  }

  private _customizeButton(): void {
    const { buttonSettings } = this._visaConfig.visaCheckout;
    const url = new URL(VisaButtonProps.src);
    this._urls.buttonUrl = url.href;
    Object.keys(buttonSettings).forEach((item: any) => {
      // @ts-ignore
      if (buttonSettings[item]) {
        // @ts-ignore
        url.searchParams.append(`${item}`, buttonSettings[item]);
      }
    });
  }

  private _createButton = (): HTMLElement => DomMethods.createHtmlElement.apply(this, [VisaButtonProps, 'img']);

  private _injectButton = (target: string): Element => DomMethods.appendChildIntoDOM(target, this._createButton());

  private _onSuccess(payment: object): void {
    this._payment
      .processPayment(
        JwtDecode<IDecodedJwt>(this._jwt).payload.requesttypedescriptions,
        { walletsource: 'VISACHECKOUT', wallettoken: JSON.stringify(payment) },
        DomMethods.parseForm(this._formId)
      )
      .then(() => {
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        this._notification.success(PAYMENT_SUCCESS);
        GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment success');
      })
      .catch(() => {
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(PAYMENT_ERROR);
      });
  }

  private _onError(): void {
    this._notification.error(PAYMENT_ERROR);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
  }

  private _onCancel(): void {
    this._notification.cancel(PAYMENT_CANCELLED);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
    this._messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE,
        data: {
          errorcode: 'cancelled',
          errormessage: PAYMENT_CANCELLED
        }
      },
      true
    );
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment canceled');
  }

  private _setHandlers(): void {
    const { cancel, error, success } = VisaResponseTypes;

    V.init(this._visaInit);

    V.on(success, (payment: object) => {
      this._onSuccess(payment);
    });

    V.on(error, () => {
      this._onError();
    });

    V.on(cancel, () => {
      this._onCancel();
    });
  }
}
