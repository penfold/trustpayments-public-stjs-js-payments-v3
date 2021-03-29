import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { ContainerInstance, Service } from 'typedi';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { environment } from '../../../environments/environment';
import { MessageSubscriberRegistry } from '../../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import {
  MessageBusToken,
  MessageSubscriberToken,
  StoreToken,
  TranslatorToken
} from '../../../shared/dependency-injection/InjectionTokens';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';

@Service()
export class ComponentBootstrap {
  constructor(private frameIdentifier: FrameIdentifier, private container: ContainerInstance) {}

  run<T>(frameName: string, componentClass: new (...args: any[]) => T): T {
    this.frameIdentifier.setFrameName(frameName);

    this.container.get(InterFrameCommunicator).init();
    this.container.get(MessageBusToken);
    this.container.get(StoreToken);
    this.container.get(BrowserLocalStorage).init();
    this.container.get(TranslatorToken).init();

    const framesHub: FramesHub = this.container.get(FramesHub);
    framesHub.init();
    framesHub.notifyReadyState();

    if (this.frameIdentifier.isControlFrame()) {
      this.container.get(MessageSubscriberRegistry).register(...this.container.getMany(MessageSubscriberToken));
    }

    const component = this.container.get(componentClass);

    this.container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);

    return component;
  }
}
