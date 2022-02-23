import { ContainerInstance, Service } from 'typedi';
import { first } from 'rxjs/operators';
import { SentryService } from '../../shared/services/sentry/SentryService';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { environment } from '../../environments/environment';
import { MessageSubscriberRegistry } from '../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../shared/services/message-bus/FrameIdentifier';
import { ST } from '../st/ST';
import { IConfig } from '../../shared/model/config/IConfig';
import { MERCHANT_PARENT_FRAME } from '../../application/core/models/constants/Selectors';
import {
  MessageBusToken,
  MessageSubscriberToken,
  StoreToken,
  TranslatorToken,
} from '../../shared/dependency-injection/InjectionTokens';
import { FramesHub } from '../../shared/services/message-bus/FramesHub';
import { InterFrameCommunicator } from '../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';

@Service()
export class ClientBootstrap {
  private isAlreadyRunning = false;

  constructor(private frameIdentifier: FrameIdentifier, private container: ContainerInstance) {
  }

  run(config: IConfig): ST {
    if(this.isAlreadyRunning) {
      this.container.get(ST).destroy();
      console.warn('The current instance of ST has been destroyed as a result of starting ST again');
    }

    this.isAlreadyRunning = true;
    this.frameIdentifier.setFrameName(MERCHANT_PARENT_FRAME);
    this.container.set({ id: SentryService, type: SentryService });
    this.container.get(SentryService).init(environment.SENTRY.DSN, environment.SENTRY.ALLOWED_URLS);
    this.container.get(InterFrameCommunicator).init();
    this.container.get(FramesHub).init();
    this.container.get(MessageBusToken);
    this.container.get(StoreToken);
    this.container.get(BrowserLocalStorage).init();
    this.container.get(MessageSubscriberRegistry).register(...this.container.getMany(MessageSubscriberToken));
    this.container.get(TranslatorToken).init();

    const st: ST = this.container.get(ST);
    const messageBus: IMessageBus = this.container.get(MessageBusToken);

    st.init(config);

    messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY), first()).subscribe(() => {
      this.isAlreadyRunning = false;
    });

    return st;
  }
}
