import { ContainerInstance, Service } from 'typedi';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { environment } from '../../../environments/environment';
import { MessageSubscriberRegistry } from '../../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import {
  MessageBusToken,
  MessageSubscriberToken,
  StoreToken,
  TranslatorToken,
} from '../../../shared/dependency-injection/InjectionTokens';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { GoogleAnalytics } from '../integrations/google-analytics/GoogleAnalytics';

@Service()
export class ComponentBootstrap {
  constructor(private frameIdentifier: FrameIdentifier, private container: ContainerInstance) {}

  run<T>(frameName: string, componentClass: new (...args: unknown[]) => T): T {
    this.frameIdentifier.setFrameName(frameName);

    this.container.get(SentryService).init(environment.SENTRY.DSN, environment.SENTRY.ALLOWED_URLS);
    this.container.get(InterFrameCommunicator).init();
    this.container.get(MessageBusToken);
    this.container.get(StoreToken);
    this.container.get(BrowserLocalStorage).init();
    this.container.get(TranslatorToken).init();
    this.container.get(GoogleAnalytics).init();

    const framesHub: FramesHub = this.container.get(FramesHub);
    framesHub.init();
    framesHub.notifyReadyState();

    if (this.frameIdentifier.isControlFrame()) {
      this.container.get(MessageSubscriberRegistry).register(...this.container.getMany(MessageSubscriberToken));
    }

    return this.container.get(componentClass);
  }
}
