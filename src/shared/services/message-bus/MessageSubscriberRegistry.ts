import { Service } from 'typedi';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IMessageSubscriber } from './interfaces/IMessageSubscriber';

@Service()
export class MessageSubscriberRegistry {
  constructor(private messageBus: IMessageBus) {}

  register(...messageSubscribers: IMessageSubscriber[]): void {
    messageSubscribers.forEach(subscriber => subscriber.register(this.messageBus));
  }
}
