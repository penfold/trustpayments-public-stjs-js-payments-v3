import { instance, mock, verify } from 'ts-mockito';
import { MessageSubscriberRegistry } from './MessageSubscriberRegistry';
import { IMessageSubscriber } from './interfaces/IMessageSubscriber';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';

describe('MessageSubscriberRegistry', () => {
  let messageBus: MessageBus;
  let messageSubscriberRegistry: MessageSubscriberRegistry;

  beforeEach(() => {
    messageBus = instance(mock(MessageBus));
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
