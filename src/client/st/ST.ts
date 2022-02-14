import './st.css';
import { Container, Service } from 'typedi';
import { firstValueFrom, from, Observable, Subject, Subscription } from 'rxjs';
import { delay, map, mapTo, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import '../../application/core/shared/override-domain/OverrideDomain';
import { CardFrames } from '../card-frames/CardFrames';
import { CommonFrames } from '../common-frames/CommonFrames';
import { ThreeDSecureClient } from '../integrations/three-d-secure/ThreeDSecureClient';
import { MerchantFields } from '../merchant-fields/MerchantFields';
import { GoogleAnalytics } from '../../application/core/integrations/google-analytics/GoogleAnalytics';
import { VisaCheckout } from '../../application/core/integrations/visa-checkout/VisaCheckout';
import { IComponentsConfig } from '../../shared/model/config/IComponentsConfig';
import { IConfig } from '../../shared/model/config/IConfig';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { ISubmitEvent } from '../../application/core/models/ISubmitEvent';
import { ISuccessEvent } from '../../application/core/models/ISuccessEvent';
import { IErrorEvent } from '../../application/core/models/IErrorEvent';
import { InterFrameCommunicator } from '../../shared/services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../../shared/services/message-bus/FramesHub';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { Frame } from '../../application/core/shared/frame/Frame';
import { CONTROL_FRAME_IFRAME } from '../../application/core/models/constants/Selectors';
import { CardinalClient } from '../integrations/cardinal-commerce/CardinalClient';
import { ClientBootstrap } from '../client-bootstrap/ClientBootstrap';
import { BrowserDetector } from '../../shared/services/browser-detector/BrowserDetector';
import { Notification } from '../../application/core/shared/notification/Notification';
import { NotificationService } from '../notification/NotificationService';
import { IBrowserInfo } from '../../shared/services/browser-detector/IBrowserInfo';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { IStore } from '../../application/core/store/IStore';
import { IParentFrameState } from '../../application/core/store/state/IParentFrameState';
import { IVisaCheckoutConfig } from '../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { IUpdateJwt } from '../../application/core/models/IUpdateJwt';
import { GooglePayConfigName, IGooglePayConfig } from '../../integrations/google-pay/models/IGooglePayConfig';
import { ApplePayConfigName } from '../../integrations/apple-pay/models/IApplePayConfig';
import { IInitPaymentMethod } from '../../application/core/services/payments/events/IInitPaymentMethod';
import { GooglePaymentMethodName } from '../../integrations/google-pay/models/IGooglePaymentMethod';
import { ApplePayPaymentMethodName } from '../../integrations/apple-pay/models/IApplePayPaymentMethod';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { IStJwtPayload } from '../../application/core/models/IStJwtPayload';
import { ExposedEvents, ExposedEventsName } from '../../application/core/models/constants/ExposedEvents';
import { EventScope } from '../../application/core/models/constants/EventScope';
import { IAPMConfig } from '../../integrations/apm/models/IAPMConfig';
import { APMPaymentMethodName } from '../../integrations/apm/models/IAPMPaymentMethod';
import { FraudControlService } from '../../application/core/services/fraud-control/FraudControlService';
import { SentryService } from '../../shared/services/sentry/SentryService';
import { IApplePayConfig } from '../../integrations/apple-pay/client/models/IApplePayConfig';
import { GAEventType } from '../../application/core/integrations/google-analytics/events';
import { ISetPartialConfig } from '../../application/core/services/store-config-provider/events/ISetPartialConfig';
import { IClickToPayConfig } from '../../integrations/click-to-pay/models/IClickToPayConfig';
import { ClickToPayAdapterFactory } from '../../integrations/click-to-pay/adapter/ClickToPayAdapterFactory';
import { IClickToPayAdapter } from '../../integrations/click-to-pay/adapter/IClickToPayClientAdapter';
import { HPPClickToPayAdapter } from '../../integrations/click-to-pay/adapter/hosted-payments-page-click-to-pay-adapter/HPPClickToPayAdapter';
import { IClickToPayAdapterInitParams } from '../../integrations/click-to-pay/adapter/IClickToPayAdapterInitParams';

declare const ST_VERSION: string | undefined;

@Service()
export class ST {
  private config: IConfig;
  private controlFrameLoader$: Observable<IConfig>;
  private destroy$: Subject<void> = new Subject();
  private registeredCallbacks: Map<keyof typeof ExposedEvents, Subscription> = new Map();

  set submitCallback(callback: (event: ISubmitEvent) => void) {
    if (callback) {
      this.on(ExposedEventsName.SUBMIT, callback);
    } else {
      this.off(ExposedEventsName.SUBMIT);
    }
  }

  set successCallback(callback: (event: ISuccessEvent) => void) {
    if (callback) {
      this.on(ExposedEventsName.SUCCESS, callback);
    } else {
      this.off(ExposedEventsName.SUCCESS);
    }
  }

  set errorCallback(callback: (event: IErrorEvent) => void) {
    if (callback) {
      this.on(ExposedEventsName.ERROR, callback);
    } else {
      this.off(ExposedEventsName.ERROR);
    }
  }

  set cancelCallback(callback: (event: IErrorEvent) => void) {
    if (callback) {
      this.on(ExposedEventsName.CANCEL, callback);
    } else {
      this.off(ExposedEventsName.CANCEL);
    }
  }

  constructor(
    private browserDetector: BrowserDetector,
    private cardinalClient: CardinalClient,
    private threeDSecureClient: ThreeDSecureClient,
    private communicator: InterFrameCommunicator,
    private configProvider: ConfigProvider,
    private configService: ConfigService,
    private fraudControlService: FraudControlService,
    private frameService: Frame,
    private framesHub: FramesHub,
    private iframeFactory: IframeFactory,
    private jwtDecoder: JwtDecoder,
    private messageBus: IMessageBus,
    private notification: Notification,
    private notificationService: NotificationService,
    private storage: BrowserLocalStorage,
    private store: IStore<IParentFrameState>,
    private visaCheckout: VisaCheckout,
    private commonFrames: CommonFrames,
    private translation: ITranslator,
    private googleAnalytics: GoogleAnalytics,
    private merchantFields: MerchantFields,
    private cardFrames: CardFrames,
    private sentryService: SentryService,
    private clickToPayAdapterFactory: ClickToPayAdapterFactory
  ) {
  }

  on(eventName: keyof typeof ExposedEvents, callback: (event: unknown) => void): void {
    this.off(eventName);
    this.registeredCallbacks[eventName] = this.messageBus
      .pipe(
        ofType(ExposedEvents[eventName]),
        map(event => event.data),
        delay(0),
        takeUntil(this.destroy$)
      )
      .subscribe(callback);
  }

  off(eventName: keyof typeof ExposedEvents): void {
    if (this.registeredCallbacks[eventName]) {
      this.registeredCallbacks[eventName].unsubscribe();
      this.registeredCallbacks[eventName] = undefined;
    }
  }

  Components(config: IComponentsConfig | undefined): void {

    this.messageBus.publish<ISetPartialConfig<IComponentsConfig>>(
      {
        type: PUBLIC_EVENTS.PARTIAL_CONFIG_SET,
        data: {
          name: 'components',
          config,
        },
      },
      EventScope.ALL_FRAMES
    );

    if (config) {
      this.config = this.configService.updateFragment('components', config);
    }

    this.initControlFrame$().subscribe(() => {
      this.cardFrames.init();
      this.messageBus.publish<string>(
        {
          type: PUBLIC_EVENTS.CARD_PAYMENTS_INIT,
          data: JSON.stringify(this.config),
        },
        EventScope.THIS_FRAME
      );
    });
  }

  APM(config: IAPMConfig): void {

    this.messageBus.publish<ISetPartialConfig<IAPMConfig>>(
      {
        type: PUBLIC_EVENTS.PARTIAL_CONFIG_SET,
        data: {
          name: APMPaymentMethodName,
          config,
        },
      },
      EventScope.ALL_FRAMES
    );

    this.initControlFrame$().subscribe(() => {
      this.messageBus.publish<IInitPaymentMethod<IAPMConfig>>(
        {
          type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
          data: {
            name: APMPaymentMethodName,
            config,
          },
        },
        EventScope.THIS_FRAME
      );
    });
  }

  ApplePay(config: IApplePayConfig): void {

    this.messageBus.publish<ISetPartialConfig<IApplePayConfig>>(
      {
        type: PUBLIC_EVENTS.PARTIAL_CONFIG_SET,
        data: {
          name: GooglePaymentMethodName,
          config,
        },
      },
      EventScope.ALL_FRAMES
    );

    if (config) {
      this.config = this.configService.updateFragment(ApplePayConfigName, config);
    }

    this.initControlFrame$().subscribe(() => {
      this.messageBus.publish<IInitPaymentMethod<IConfig>>(
        {
          type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
          data: {
            name: ApplePayPaymentMethodName,
            config: this.config,
          },
        },
        EventScope.THIS_FRAME
      );
    });
  }

  GooglePay(config: IGooglePayConfig): void {

    this.messageBus.publish<ISetPartialConfig<IGooglePayConfig>>(
      {
        type: PUBLIC_EVENTS.PARTIAL_CONFIG_SET,
        data: {
          name: GooglePaymentMethodName,
          config,
        },
      },
      EventScope.ALL_FRAMES
    );

    if (config) {
      this.config = this.configService.updateFragment(GooglePayConfigName, config);
    }

    this.initControlFrame$().subscribe(() => {
      this.messageBus.publish<IInitPaymentMethod<IConfig>>(
        {
          type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
          data: {
            name: GooglePaymentMethodName,
            config: this.config,
          },
        },
        EventScope.THIS_FRAME
      );
    });
  }

  VisaCheckout(visaCheckoutConfig: IVisaCheckoutConfig | undefined): void {

    this.messageBus.publish<ISetPartialConfig<IVisaCheckoutConfig>>(
      {
        type: PUBLIC_EVENTS.PARTIAL_CONFIG_SET,
        data: {
          name: 'VisaCheckout',
          config: visaCheckoutConfig,
        },
      },
      EventScope.ALL_FRAMES
    );

    if (visaCheckoutConfig) {
      this.config = this.configService.updateFragment('visaCheckout', visaCheckoutConfig);
    }

    this.initControlFrame$().subscribe(() => {
      this.visaCheckout.init();
      this.messageBus.publish<undefined>(
        {
          type: PUBLIC_EVENTS.VISA_CHECKOUT_INIT,
          data: undefined,
        },
        EventScope.THIS_FRAME
      );
    });
  }

  ClickToPay(clickToPayConfig: IClickToPayConfig):Promise<IClickToPayAdapter<IClickToPayAdapterInitParams, any> | HPPClickToPayAdapter>{
    return firstValueFrom(
      this.initControlFrame$().pipe(
        mapTo(this.clickToPayAdapterFactory.create(clickToPayConfig.adapter)),
      )
    );
  }

  Cybertonica(): Promise<string | null> {
    const message = 'The Cybertonica() function is deprected.';

    console.warn(message);

    this.sentryService.sendCustomMessage(new Error(message));

    return Promise.resolve(null);
  }

  updateJWT(jwt: string): void {
    if (jwt) {
      this.config = this.configService.updateProp('jwt', jwt);
      this.messageBus.publish<IUpdateJwt>({
        type: PUBLIC_EVENTS.UPDATE_JWT,
        data: { newJwt: jwt },
      });
    } else {
      throw Error(this.translation.translate('Jwt has not been specified'));
    }
  }

  destroy(): void {
    this.framesHub.reset();
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.DESTROY,
      },
      EventScope.ALL_FRAMES
    );

    this.destroy$.next();
    this.destroy$.complete();
    this.communicator.close();
    this.controlFrameLoader$ = undefined;
  }

  init(config: IConfig): void {

    this.messageBus.publish<ISetPartialConfig<IConfig>>(
      {
        type: PUBLIC_EVENTS.PARTIAL_CONFIG_SET,
        data: {
          name: 'config',
          config,
        },
      },
      EventScope.ALL_FRAMES
    );

    this.framesHub.reset();
    this.storage.init();
    this.config = this.configService.setup(config);

    if (this.config.jwt) {
      this.initCallbacks(config);
      this.Storage();
      this.googleAnalytics.init();
      this.commonFrames.init();
      this.displayLiveStatus(Boolean(this.config.livestatus));
      this.watchForFrameUnload();
      this.cardinalClient.init();
      this.threeDSecureClient.init();

      this.googleAnalytics.sendGaData('event', 'ST', GAEventType.INIT, `ST init - version ${ST_VERSION}`);

      if (this.config.stopSubmitFormOnEnter) {
        this.stopSubmitFormOnEnter();
      }
    }

    return;
  }

  getBrowserInfo(): IBrowserInfo {
    return this.browserDetector.getBrowserInfo();
  }

  cancelThreeDProcess(): void {
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.THREED_CANCEL,
      }, EventScope.ALL_FRAMES
    );
  }

  private stopSubmitFormOnEnter() {
    const form: HTMLFormElement = document.getElementById(this.config.formId) as HTMLFormElement;

    if (!form) {
      return;
    }

    form.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
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
          data: JSON.stringify(this.config),
        };

        return from(this.communicator.query(queryEvent, controlFrame));
      }),
      tap(() => {
        this.merchantFields.init();
      }),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    return this.controlFrameLoader$;
  }

  private Storage(): void {
    this.storage.setItem('merchantTranslations', JSON.stringify(this.config.translations));
    this.storage.setItem('locale', this.jwtDecoder.decode<IStJwtPayload>(this.config.jwt).payload.locale || 'en_GB');
  }

  private displayLiveStatus(liveStatus: boolean): void {
    if (!liveStatus) {
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
      childList: true,
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

export default (config: IConfig): ST => {
  return Container.get(ClientBootstrap).run(config);
};
