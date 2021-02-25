import { SentryService } from '../../shared/services/sentry/SentryService';
import { ContainerInstance, Service } from 'typedi';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { environment } from '../../environments/environment';
import { MessageSubscriberRegistry } from '../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../shared/services/message-bus/FrameIdentifier';
import { ST } from '../st/ST';
import { IConfig } from '../../shared/model/config/IConfig';
import { MERCHANT_PARENT_FRAME } from '../../application/core/models/constants/Selectors';
import { MessageBusToken, MessageSubscriberToken, StoreToken } from '../../shared/dependency-injection/InjectionTokens';
import { FramesHub } from '../../shared/services/message-bus/FramesHub';
import { InterFrameCommunicator } from '../../shared/services/message-bus/InterFrameCommunicator';

@Service()
export class ClientBootstrap {
  constructor(private frameIdentifier: FrameIdentifier, private container: ContainerInstance) {}

  run(config: IConfig): ST {
    this.frameIdentifier.setFrameName(MERCHANT_PARENT_FRAME);

    this.container.get(InterFrameCommunicator).init();
    this.container.get(FramesHub).init();
    this.container.get(MessageBusToken);
    this.container.get(StoreToken);
    this.container.get(BrowserLocalStorage).init();
    this.container.get(MessageSubscriberRegistry).register(...this.container.getMany(MessageSubscriberToken));

    const st = this.container.get(ST);

    this.container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);

    st.init(config);

    return st;
  }
}
