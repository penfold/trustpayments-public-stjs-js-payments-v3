import { VisaCheckoutClient } from '../../../../client/integrations/visa-checkout/VisaCheckoutClient';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { IMerchantData } from '../../models/IMerchantData';
import { IUpdateJwt } from '../../models/IUpdateJwt';
import { IWallet } from '../../models/IWallet';
import { IVisaCheckoutButtonSettings } from './visa-checkout-button-service/IVisaCheckoutButtonSettings';
import { IVisaCheckoutInitConfig } from './IVisaCheckoutInitConfig';
import { PAYMENT_CANCELLED, PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { VisaCheckoutResponseTypes } from './VisaCheckoutResponseTypes';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { Payment } from '../../shared/payment/Payment';
import { StJwt } from '../../shared/stjwt/StJwt';
import { VisaCheckoutButtonService } from './visa-checkout-button-service/VisaCheckoutButtonService';
import { VisaCheckoutUpdateService } from './visa-checkout-update-service/VisaCheckoutUpdateService';
import { IStJwtObj } from '../../models/IStJwtObj';

declare const V: any;

@Service()
export class VisaCheckout {
  private _buttonUrl: string;
  private _buttonSettings: IVisaCheckoutButtonSettings;
  private _formId: string;
  private _jwt: string;
  private _visaInitConfig: IVisaCheckoutInitConfig;
  private readonly _config$: Observable<IConfig>;

  constructor(
    private _configProvider: ConfigProvider,
    private _communicator: InterFrameCommunicator,
    private _messageBus: MessageBus,
    private _notification: NotificationService,
    private _visaCheckoutButtonService: VisaCheckoutButtonService,
    private _visaCheckoutUpdateService: VisaCheckoutUpdateService,
    private _jwtDecoder: JwtDecoder,
    private _visaCheckoutClient: VisaCheckoutClient
  ) {
    console.log(this._configProvider);
    this._config$ = this._configProvider.getConfig$();
    this._updateConfigListener();
    this._updateJwtListener();
    this._visaCheckoutClient.init();
  }

  private _updateConfigListener(): void {
    this._config$.subscribe(({ jwt, formId, livestatus, visaCheckout }: IConfig) => {
      this._jwt = jwt;
      this._formId = formId;
      const { payload }: IStJwtObj = new StJwt(jwt);
      const updatedConfig = this._visaCheckoutUpdateService.updateConfigObject(visaCheckout, payload, livestatus);
      this._buttonSettings = visaCheckout.buttonSettings;
      this._buttonUrl = updatedConfig.buttonUrl;
      this._visaInitConfig = updatedConfig.visaInit;
      this._visaCheckoutButtonService.customize(this._buttonSettings, this._buttonUrl);
      this._loadSdk(visaCheckout.placement, updatedConfig.sdkUrl, this._buttonUrl, this._buttonSettings);
    });
  }

  private _updateJwtListener(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, ({ newJwt }: IUpdateJwt) => {
      this._jwt = newJwt ? newJwt : this._jwt;
      const { payload }: IStJwtObj = new StJwt(this._jwt);
      this._visaInitConfig = this._visaCheckoutUpdateService.updateVisaInit(payload, this._visaInitConfig);
      this._visaCheckoutButtonService.customize(this._buttonSettings, this._buttonUrl);
    });
  }

  private _loadSdk(target: string, sdkUrl: string, buttonUrl: string, buttonSettings: {}): void {
    DomMethods.insertScript(target, { src: sdkUrl, id: 'visaCheckout' })
      .then(() => {
        this._visaCheckoutButtonService.mount(target, buttonSettings, buttonUrl);
        this._setHandlers();
      })
      .catch((e: string) => {
        throw new Error(e);
      });
  }

  private _setHandlers(): void {
    const { cancel, error, success } = VisaCheckoutResponseTypes;

    V.init(this._visaInitConfig);

    V.on(success, (payment: object) => {
      this.onSuccess(payment);
      this._communicator.query({ type: PUBLIC_EVENTS.VISA_CHECKOUT_SUCCESS }, CONTROL_FRAME_IFRAME);
    });

    V.on(error, () => {
      this.onError();
    });

    V.on(cancel, () => {
      this.onCancel();
    });
  }

  protected onSuccess(payment: object): void {
    const paymentInstance: Payment = new Payment();
    const { requesttypedescriptions } = this._jwtDecoder.decode(this._jwt).payload;
    console.log('requesttypedescriptions', requesttypedescriptions);
    const walletdata: IWallet = {
      walletsource: 'VISACHECKOUT',
      wallettoken: JSON.stringify(payment)
    };
    console.log('walletdata', walletdata);

    const merchantData: IMerchantData = DomMethods.parseForm(this._formId) ? DomMethods.parseForm(this._formId) : {};
    console.log('merchantData', merchantData);

    paymentInstance
      .processPayment(requesttypedescriptions, walletdata, merchantData)
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

  protected onError(): void {
    this._notification.error(PAYMENT_ERROR);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
  }

  protected onCancel(): void {
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
}
