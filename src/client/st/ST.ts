import './st.css';
import jwt_decode from 'jwt-decode';
import { ApplePayMock } from '../../application/core/integrations/apple-pay/ApplePayMock';
import { debounce } from 'lodash';
import '../../application/core/shared/override-domain/OverrideDomain';
import { environment } from '../../environments/environment';
import { CardFrames } from '../card-frames/CardFrames.class';
import { CommonFrames } from '../common-frames/CommonFrames.class';
import { MerchantFields } from '../merchant-fields/MerchantFields';
import { StCodec } from '../../application/core/services/st-codec/StCodec.class';
import { ApplePay } from '../../application/core/integrations/apple-pay/ApplePay';
import { GoogleAnalytics } from '../../application/core/integrations/google-analytics/GoogleAnalytics';
import { VisaCheckout } from '../../application/core/integrations/visa-checkout/VisaCheckout';
import { IComponentsConfig } from '../../shared/model/config/IComponentsConfig';
import { IConfig } from '../../shared/model/config/IConfig';
import { IStJwtObj } from '../../application/core/models/IStJwtObj';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { Translator } from '../../application/core/shared/translator/Translator';
import { Service, Container } from 'typedi';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { ISubmitEvent } from '../../application/core/models/ISubmitEvent';
import { ISuccessEvent } from '../../application/core/models/ISuccessEvent';
import { IErrorEvent } from '../../application/core/models/IErrorEvent';
import { InterFrameCommunicator } from '../../shared/services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../../shared/services/message-bus/FramesHub';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { Notification } from '../../application/core/shared/notification/Notification';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { Subject, Subscription } from 'rxjs';
import { delay, map, takeUntil } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { Frame } from '../../application/core/shared/frame/Frame';
import { CONTROL_FRAME_IFRAME } from '../../application/core/models/constants/Selectors';
import { CardinalClient } from '../integrations/cardinal-commerce/CardinalClient';
import { ClientBootstrap } from '../client-bootstrap/ClientBootstrap';
import { BrowserDetector } from '../../shared/services/browser-detector/BrowserDetector';
import { IBrowserInfo } from '../../shared/services/browser-detector/IBrowserInfo';
import { IDecodedJwt } from '../../application/core/models/IDecodedJwt';
import { IVisaCheckoutConfig } from '../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { IStJwtPayload } from '../../application/core/models/IStJwtPayload';
import { Cybertonica } from '../../application/core/integrations/cybertonica/Cybertonica';
import { ApplePayNetworksService } from '../../application/core/integrations/apple-pay/apple-pay-networks-service/ApplePayNetworksService';
import { ApplePayButtonService } from '../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { NotificationService } from '../notification/NotificationService';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { IApplePayConfig } from '../../application/core/integrations/apple-pay/IApplePayConfig';

@Service()
export class ST {
  private static DEBOUNCE_JWT_VALUE: number = 900;
  private static JWT_NOT_SPECIFIED_MESSAGE: string = 'Jwt has not been specified';
  private static LOCALE_STORAGE: string = 'locale';
  private static MERCHANT_TRANSLATIONS_STORAGE: string = 'merchantTranslations';
  private static readonly MODAL_CONTROL_FRAME_CLASS = 'modal';
  private static readonly BUTTON_SUBMIT_SELECTOR: string = 'button[type="submit"]';
  private static readonly INPUT_SUBMIT_SELECTOR: string = 'input[type="submit"]';
  private static readonly BUTTON_DISABLED_CLASS: string = 'st-button-submit__disabled';
  private _config: IConfig;
  private _cardFrames: CardFrames;
  private _commonFrames: CommonFrames;
  private _googleAnalytics: GoogleAnalytics;
  private _merchantFields: MerchantFields;
  private _translation: Translator;
  private _destroy$: Subject<void> = new Subject();
  private _registeredCallbacks: { [eventName: string]: Subscription } = {};
  private _cybertonicaTid: Promise<string>;

  set submitCallback(callback: (event: ISubmitEvent) => void) {
    if (callback) {
      this.on('submit', callback);
    } else {
      this.off('submit');
    }
  }

  set successCallback(callback: (event: ISuccessEvent) => void) {
    if (callback) {
      this.on('success', callback);
    } else {
      this.off('success');
    }
  }

  set errorCallback(callback: (event: IErrorEvent) => void) {
    if (callback) {
      this.on('error', callback);
    } else {
      this.off('error');
    }
  }

  set cancelCallback(callback: (event: IErrorEvent) => void) {
    if (callback) {
      this.on('cancel', callback);
    } else {
      this.off('cancel');
    }
  }

  constructor(
    private _configService: ConfigService,
    private _configProvider: ConfigProvider,
    private _communicator: InterFrameCommunicator,
    private _framesHub: FramesHub,
    private _storage: BrowserLocalStorage,
    private _messageBus: IMessageBus,
    private _notification: Notification,
    private _notificationService: NotificationService,
    private _iframeFactory: IframeFactory,
    private _frameService: Frame,
    private _browserDetector: BrowserDetector,
    private _visaCheckout: VisaCheckout,
    private _cybertonica: Cybertonica,
    private _cardinalClient: CardinalClient,
    private _applePayNetworkService: ApplePayNetworksService,
    private _applePayButtonService: ApplePayButtonService
  ) {
    this._googleAnalytics = new GoogleAnalytics();
    this._merchantFields = new MerchantFields();
  }

  public on(eventName: 'success' | 'error' | 'submit' | 'cancel', callback: (event: any) => void): void {
    const events = {
      cancel: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK,
      success: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK,
      error: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK,
      submit: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUBMIT_CALLBACK
    };

    this.off(eventName);

    this._registeredCallbacks[eventName] = this._messageBus
      .pipe(
        ofType(events[eventName]),
        map(event => event.data),
        delay(0),
        takeUntil(this._destroy$)
      )
      .subscribe(callback);
  }

  public off(eventName: string): void {
    if (this._registeredCallbacks[eventName]) {
      this._registeredCallbacks[eventName].unsubscribe();
      this._registeredCallbacks[eventName] = undefined;
    }
  }

  public Components(config: IComponentsConfig | undefined): void {
    if (config) {
      this._config = this._configService.updateFragment('components', config);
    }

    this.blockSubmitButton();
    // @ts-ignore
    this._commonFrames._requestTypes = jwt_decode<IDecodedJwt>(this._config.jwt).payload.requesttypedescriptions;
    this._framesHub
      .waitForFrame(CONTROL_FRAME_IFRAME)
      .pipe(
        switchMap(controlFrame => {
          const queryEvent: IMessageBusEvent<string> = {
            type: PUBLIC_EVENTS.INIT_CONTROL_FRAME,
            data: JSON.stringify(this._config)
          };

          return from(this._communicator.query(queryEvent, controlFrame));
        })
      )
      .subscribe(() => {
        this.CardFrames();
        this._cardFrames.init();
        this._merchantFields.init();
      });
  }

  public ApplePay(config: IApplePayConfig): ApplePay {
    if (config) {
      this._config = this._configService.updateFragment('applePay', config);
    }

    if (environment.testEnvironment) {
      return new ApplePayMock(
        this._communicator,
        this._configProvider,
        this._storage,
        this._notificationService,
        this._applePayButtonService,
        this._applePayNetworkService
      );
    } else {
      return new ApplePay(
        this._communicator,
        this._configProvider,
        this._storage,
        this._notificationService,
        this._applePayButtonService,
        this._applePayNetworkService
      );
    }
  }

  public VisaCheckout(visaCheckoutConfig: IVisaCheckoutConfig | undefined): void {
    if (visaCheckoutConfig) {
      this._config = this._configService.updateFragment('visaCheckout', visaCheckoutConfig);
    }

    this._visaCheckout.init();
  }

  public Cybertonica(): Promise<string> {
    if (!this._cybertonicaTid) {
      this._cybertonica.init(this._config.cybertonicaApiKey);
      this._cybertonicaTid = this._cybertonica.getTransactionId();
    }

    return this._cybertonicaTid;
  }

  public updateJWT(jwt: string): void {
    if (jwt) {
      this._config = this._configService.updateJwt(jwt);
      (() => {
        const a = StCodec.updateJWTValue(jwt);
        debounce(() => a, ST.DEBOUNCE_JWT_VALUE);
      })();
    } else {
      throw Error(this._translation.translate(ST.JWT_NOT_SPECIFIED_MESSAGE));
    }
  }

  public destroy(): void {
    this._messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.DESTROY
      },
      true
    );

    this._destroy$.next();
    this._destroy$.complete();
    this._communicator.close();
  }

  public init(config: IConfig): void {
    this._framesHub.reset();
    this._storage.init();
    this._config = this._configService.setup(config);
    if (this._config.jwt) {
      StCodec.updateJWTValue(config.jwt);
      this.initCallbacks(config);
      this.Storage();
      this._translation = new Translator(this._storage.getItem(ST.LOCALE_STORAGE));
      this._googleAnalytics.init();
      this.CommonFrames();
      this._commonFrames.init();
      this.displayLiveStatus(Boolean(this._config.livestatus));
      this.watchForFrameUnload();
      this.initControlFrameModal();
      this._cardinalClient.init();
    }
  }

  public getBrowserInfo(): IBrowserInfo {
    return this._browserDetector.getBrowserInfo();
  }

  private CardFrames(): void {
    this._cardFrames = new CardFrames(
      this._config.jwt,
      this._config.origin,
      this._config.componentIds,
      this._config.styles,
      this._config.components.paymentTypes,
      this._config.components.defaultPaymentType,
      this._config.animatedCard,
      this._config.buttonId,
      this._config.fieldsToSubmit,
      this._config.formId,
      this._configProvider,
      this._iframeFactory,
      this._frameService,
      this._messageBus
    );
  }

  private CommonFrames(): void {
    const requestTypes: string[] = jwt_decode<IDecodedJwt>(this._config.jwt).payload.requesttypedescriptions;
    this._commonFrames = new CommonFrames(
      this._config.jwt,
      this._config.origin,
      this._config.componentIds,
      this._config.styles,
      this._config.submitOnSuccess,
      this._config.submitOnError,
      this._config.submitOnCancel,
      this._config.submitFields,
      this._config.datacenterurl,
      this._config.animatedCard,
      requestTypes,
      this._config.formId,
      this._iframeFactory,
      this._frameService
    );
  }

  private Storage(): void {
    this._storage.setItem(ST.MERCHANT_TRANSLATIONS_STORAGE, JSON.stringify(this._config.translations));
    this._storage.setItem(ST.LOCALE_STORAGE, jwt_decode<IStJwtObj<IStJwtPayload>>(this._config.jwt).payload.locale);
  }

  private displayLiveStatus(liveStatus: boolean): void {
    if (!liveStatus) {
      /* tslint:disable:no-console */
      console.log(
        '%cThe %csecure%c//%ctrading %cLibrary is currently working in test mode. Please check your configuration.',
        'margin: 100px 0; font-size: 2em; color: #e71b5a',
        'font-size: 2em; font-weight: bold',
        'font-size: 2em; font-weight: 1000; color: #e71b5a',
        'font-size: 2em; font-weight: bold',
        'font-size: 2em; font-weight: regular; color: #e71b5a'
      );
    }
  }

  private watchForFrameUnload(): void {
    const controlFrameStatus = [false, false];

    const observer = new MutationObserver(() => {
      const controlFrame = document.getElementById(CONTROL_FRAME_IFRAME);

      controlFrameStatus.push(Boolean(controlFrame));
      controlFrameStatus.shift();

      const [previousStatus, currentStatus] = controlFrameStatus;

      if (previousStatus && !currentStatus) {
        this.destroy();
        observer.disconnect();
      }
    });

    observer.observe(document, {
      subtree: true,
      childList: true
    });
  }

  private initCallbacks(config: IConfig): void {
    if (config.submitCallback) {
      this.submitCallback = config.submitCallback;
    }

    if (config.successCallback) {
      this.successCallback = config.successCallback;
    }

    if (config.errorCallback) {
      this.errorCallback = config.errorCallback;
    }

    if (config.cancelCallback) {
      this.cancelCallback = config.cancelCallback;
    }
  }

  private initControlFrameModal(): void {
    const className = ST.MODAL_CONTROL_FRAME_CLASS;

    this._messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_SHOW), takeUntil(this._destroy$))
      .subscribe(() => document.getElementById(CONTROL_FRAME_IFRAME).classList.add(className));

    this._messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_HIDE), takeUntil(this._destroy$))
      .subscribe(() => document.getElementById(CONTROL_FRAME_IFRAME).classList.remove(className));
  }

  private blockSubmitButton(): void {
    const form: HTMLFormElement = document.getElementById(this._config.formId) as HTMLFormElement;

    if (!form) {
      return;
    }

    const submitButton: HTMLInputElement | HTMLButtonElement =
      (document.getElementById(this._config.buttonId) as HTMLInputElement | HTMLButtonElement) ||
      form.querySelector(ST.BUTTON_SUBMIT_SELECTOR) ||
      form.querySelector(ST.INPUT_SUBMIT_SELECTOR);

    if (submitButton) {
      submitButton.classList.add(ST.BUTTON_DISABLED_CLASS);
      submitButton.disabled = true;
    }
  }
}

export default (config: IConfig) => {
  return Container.get(ClientBootstrap).run(config);
};
