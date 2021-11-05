import { instance, mock, verify } from 'ts-mockito';
import { MessageBusToken } from '../../dependency-injection/InjectionTokens';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { MessageSubscriberRegistry } from './MessageSubscriberRegistry';
import { IMessageSubscriber } from './interfaces/IMessageSubscriber';

describe('MessageSubscriberRegistry', () => {
  let messageBus: IMessageBus;
  let messageSubscriberRegistry: MessageSubscriberRegistry;

  beforeEach(() => {
    messageBus = instance(mock(MessageBusToken));
    messageSubscriberRegistry = new MessageSubscriberRegistry(messageBus);
  });

  it('registers all passed subscribers', () => {
    const subscriberOne: IMessageSubscriber = mock<IMessageSubscriber>();
    const subscriberTwo: IMessageSubscriber = mock<IMessageSubscriber>();
    const subscriberThree: IMessageSubscriber = mock<IMessageSubscriber>();

    messageSubscriberRegistry.register(instance(subscriberOne), instance(subscriberTwo), instance(subscriberThree));

    verify(subscriberOne.register(messageBus)).once();
    verify(subscriberTwo.register(messageBus)).once();
    verify(subscriberThree.register(messageBus)).once();
  });
});
