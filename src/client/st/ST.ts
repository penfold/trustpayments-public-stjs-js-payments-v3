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
import { IApplePayConfig } from '../../application/core/models/IApplePayConfig';
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
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { Observable, Subject, Subscription } from 'rxjs';
import { delay, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
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
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { IStore } from '../../application/core/store/IStore';
import { IParentFrameState } from '../../application/core/store/state/IParentFrameState';
import { Notification } from '../../application/core/shared/notification/Notification';

@Service()
export class ST {
  private cardFrames: CardFrames;
  private commonFrames: CommonFrames;
  private config: IConfig;
  private controlFrameLoader$: Observable<IConfig>;
  private cybertonicaTid: Promise<string>;
  private destroy$: Subject<void> = new Subject();
  private googleAnalytics: GoogleAnalytics;
  private merchantFields: MerchantFields;
  private registeredCallbacks: { [eventName: string]: Subscription } = {};
  private translation: Translator;

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
    private browserDetector: BrowserDetector,
    private cardinalClient: CardinalClient,
    private communicator: InterFrameCommunicator,
    private configProvider: ConfigProvider,
    private configService: ConfigService,
    private cybertonica: Cybertonica,
    private frameService: Frame,
    private framesHub: FramesHub,
    private iframeFactory: IframeFactory,
    private messageBus: IMessageBus,
    private notification: Notification,
    private storage: BrowserLocalStorage,
    private store: IStore<IParentFrameState>,
    private visaCheckout: VisaCheckout
  ) {
    this.googleAnalytics = new GoogleAnalytics();
    this.merchantFields = new MerchantFields();
  }

  on(eventName: 'success' | 'error' | 'submit' | 'cancel', callback: (event: unknown) => void): void {
    const events = {
      cancel: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK,
      success: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK,
      error: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK,
      submit: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUBMIT_CALLBACK
    };

    this.off(eventName);

    this.registeredCallbacks[eventName] = this.messageBus
      .pipe(
        ofType(events[eventName]),
        map(event => event.data),
        delay(0),
        takeUntil(this.destroy$)
      )
      .subscribe(callback);
  }

  off(eventName: string): void {
    if (this.registeredCallbacks[eventName]) {
      this.registeredCallbacks[eventName].unsubscribe();
      this.registeredCallbacks[eventName] = undefined;
    }
  }

  Components(config: IComponentsConfig | undefined): void {
    if (config) {
      this.config = this.configService.updateFragment('components', config);
    }

    this.blockSubmitButton();
    // @ts-ignore
    this.commonFrames._requestTypes = jwt_decode<IDecodedJwt>(this.config.jwt).payload.requesttypedescriptions;
    this.initControlFrame$().subscribe(() => {
      this.messageBus.publish<string>(
        {
          type: PUBLIC_EVENTS.CARD_PAYMENTS_INIT,
          data: JSON.stringify(this.config)
        },
        false
      );
      this.CardFrames();
      this.cardFrames.init();
    });
  }

  ApplePay(config: IApplePayConfig | undefined): ApplePay {
    if (config) {
      this.config = this.configService.updateFragment('applePay', config);
    }

    if (environment.testEnvironment) {
      return new ApplePayMock(this.configProvider, this.communicator);
    } else {
      return new ApplePay(this.configProvider, this.communicator);
    }
  }

  VisaCheckout(visaCheckoutConfig: IVisaCheckoutConfig | undefined): void {
    if (visaCheckoutConfig) {
      this.config = this.configService.updateFragment('visaCheckout', visaCheckoutConfig);
    }

    this.initControlFrame$().subscribe(() => {
      this.visaCheckout.init();
      this.messageBus.publish<undefined>(
        {
          type: PUBLIC_EVENTS.VISA_CHECKOUT_INIT,
          data: undefined
        },
        false
      );
    });
  }

  Cybertonica(): Promise<string> {
    if (!this.cybertonicaTid) {
      this.cybertonica.init(this.config.cybertonicaApiKey);
      this.cybertonicaTid = this.cybertonica.getTransactionId();
    }

    return this.cybertonicaTid;
  }

  updateJWT(jwt: string): void {
    if (jwt) {
      this.config = this.configService.updateJwt(jwt);
      (() => {
        const a = StCodec.updateJWTValue(jwt);
        debounce(() => a, 900);
      })();
    } else {
      throw Error(this.translation.translate('Jwt has not been specified'));
    }
  }

  destroy(): void {
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.DESTROY
      },
      true
    );

    this.destroy$.next();
    this.destroy$.complete();
    this.communicator.close();
  }

  init(config: IConfig): void {
    this.framesHub.reset();
    this.storage.init();
    this.config = this.configService.setup(config);
    if (this.config.jwt) {
      StCodec.updateJWTValue(config.jwt);
      this.initCallbacks(config);
      this.Storage();
      this.translation = new Translator(this.storage.getItem('locale'));
      this.googleAnalytics.init();
      this.CommonFrames();
      this.commonFrames.init();
      this.displayLiveStatus(Boolean(this.config.livestatus));
      this.watchForFrameUnload();
      this.initControlFrameModal();
      this.cardinalClient.init();

      if (this.config.stopKeypressEvent) {
        this.stopKeypressEvent();
      }
    }
  }

  getBrowserInfo(): IBrowserInfo {
    return this.browserDetector.getBrowserInfo();
  }

  private stopKeypressEvent() {
    const form: HTMLFormElement = document.getElementById(this.config.formId) as HTMLFormElement;

    if (!form) {
      return;
    }

    form.addEventListener('keydown', event => {
      event.preventDefault();
    });
  }

  private initControlFrame$(): Observable<IConfig> {
    if (this.controlFrameLoader$) {
      return this.controlFrameLoader$;
    }

    this.controlFrameLoader$ = this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).pipe(
      switchMap((controlFrame: string) => {
        const queryEvent: IMessageBusEvent<string> = {
          type: PUBLIC_EVENTS.INIT_CONTROL_FRAME,
          data: JSON.stringify(this.config)
        };

        return from(this.communicator.query(queryEvent, controlFrame));
      }),
      tap(() => {
        this.merchantFields.init();
      }),
      shareReplay(1)
    );

    return this.controlFrameLoader$;
  }

  private CardFrames(): void {
    this.cardFrames = new CardFrames(
      this.config.jwt,
      this.config.origin,
      this.config.componentIds,
      this.config.styles,
      this.config.components.paymentTypes,
      this.config.components.defaultPaymentType,
      this.config.animatedCard,
      this.config.buttonId,
      this.config.fieldsToSubmit,
      this.config.formId,
      this.configProvider,
      this.iframeFactory,
      this.frameService,
      this.messageBus
    );
  }

  private CommonFrames(): void {
    const requestTypes: string[] = jwt_decode<IDecodedJwt>(this.config.jwt).payload.requesttypedescriptions;
    this.commonFrames = new CommonFrames(
      this.config.jwt,
      this.config.origin,
      this.config.componentIds,
      this.config.styles,
      this.config.submitOnSuccess,
      this.config.submitOnError,
      this.config.submitOnCancel,
      this.config.submitFields,
      this.config.datacenterurl,
      this.config.animatedCard,
      requestTypes,
      this.config.formId,
      this.iframeFactory,
      this.frameService
    );
  }

  private Storage(): void {
    this.storage.setItem('merchantTranslations', JSON.stringify(this.config.translations));
    this.storage.setItem('locale', jwt_decode<IStJwtObj<IStJwtPayload>>(this.config.jwt).payload.locale);
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
    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_SHOW), takeUntil(this.destroy$))
      .subscribe(() => document.getElementById(CONTROL_FRAME_IFRAME).classList.add('modal'));

    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_HIDE), takeUntil(this.destroy$))
      .subscribe(() => document.getElementById(CONTROL_FRAME_IFRAME).classList.remove('modal'));
  }

  private blockSubmitButton(): void {
    const form: HTMLFormElement = document.getElementById(this.config.formId) as HTMLFormElement;

    if (!form) {
      return;
    }

    const submitButton: HTMLInputElement | HTMLButtonElement =
      (document.getElementById(this.config.buttonId) as HTMLInputElement | HTMLButtonElement) ||
      form.querySelector('button[type="submit"]') ||
      form.querySelector('input[type="submit"]');

    if (submitButton) {
      submitButton.classList.add('st-button-submit__disabled');
      submitButton.disabled = true;
    }
  }
}

export default (config: IConfig) => {
  return Container.get(ClientBootstrap).run(config);
};
