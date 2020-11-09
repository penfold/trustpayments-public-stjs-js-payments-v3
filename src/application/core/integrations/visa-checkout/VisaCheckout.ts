import JwtDecode from 'jwt-decode';
import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IDecodedJwt } from '../../models/IDecodedJwt';
import { IUpdateJwt } from '../../models/IUpdateJwt';
import { IWallet } from '../../models/IWallet';
import { IVisaButtonSettings } from './IVisaButtonSettings';
import { IVisaInitConfig } from './IVisaInitConfig';
import { PAYMENT_CANCELLED, PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { VisaResponseTypes } from './VisaResponseTypes';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { Payment } from '../../shared/payment/Payment';
import { StJwt } from '../../shared/stjwt/StJwt';
import { VisaCheckoutButtonService } from './VisaCheckoutButtonService';
import { VisaCheckoutUpdateService } from './VisaCheckoutUpdateService';

declare const V: any;

@Service()
export class VisaCheckout {
  private _buttonUrl: string;
  private _buttonSettings: IVisaButtonSettings;
  private _formId: string;
  private _jwt: string;
  private _visaInitConfig: IVisaInitConfig;
  private readonly _config$: Observable<IConfig>;

  constructor(
    private _configProvider: ConfigProvider,
    private _communicator: InterFrameCommunicator,
    private _messageBus: MessageBus,
    private _notification: NotificationService,
    private _visaCheckoutButtonService: VisaCheckoutButtonService,
    private _visaCheckoutUpdateService: VisaCheckoutUpdateService
  ) {
    this._config$ = this._configProvider.getConfig$();
    this._communicator.whenReceive(MessageBus.EVENTS_PUBLIC.CONFIG_CHECK).thenRespond(() => this._config$);
    this._updateConfigListener();
    this._updateJwtListener();
  }

  private _updateConfigListener(): void {
    this._config$.subscribe(({ jwt, formId, livestatus, visaCheckout }: IConfig) => {
      this._jwt = jwt;
      this._formId = formId;
      const stJwt: StJwt = new StJwt(jwt);
      const updatedConfig = this._visaCheckoutUpdateService.updateConfigObject(visaCheckout, stJwt, livestatus);
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
      const stJwt: StJwt = new StJwt(this._jwt);
      this._visaInitConfig = this._visaCheckoutUpdateService.updateVisaInit(stJwt, this._visaInitConfig);
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
    const { cancel, error, success } = VisaResponseTypes;

    V.init(this._visaInitConfig);

    V.on(success, (payment: object) => {
      this.onSuccess(payment);
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
    const { requesttypedescriptions } = JwtDecode<IDecodedJwt>(this._jwt).payload;
    const walletdata: IWallet = {
      walletsource: 'VISACHECKOUT',
      wallettoken: JSON.stringify(payment)
    };
    const merchantData: {} = DomMethods.parseForm(this._formId);

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
