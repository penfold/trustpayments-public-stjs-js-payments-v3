import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { ContainerInstance, Service } from 'typedi';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Store } from '../store/Store';
import { environment } from '../../../environments/environment';
import { MessageSubscriberRegistry } from '../../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { MessageBus } from '../shared/message-bus/MessageBus';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';

@Service()
export class ComponentBootstrap {
  constructor(private frameIdentifier: FrameIdentifier, private container: ContainerInstance) {}

  run<T>(frameName: string, componentClass: new (...args: any[]) => T): T {
    this.frameIdentifier.setFrameName(frameName);

    this.container.get(MessageBus);
    this.container.get(Store);
    this.container.get(BrowserLocalStorage).init();
    this.container.get(FramesHub).notifyReadyState();

    if (this.frameIdentifier.isControlFrame()) {
      this.container.get(MessageSubscriberRegistry).register(...this.container.getMany(MessageSubscriberToken));
    }

    const component = this.container.get(componentClass);

    this.container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);

    return component;
  }
}
