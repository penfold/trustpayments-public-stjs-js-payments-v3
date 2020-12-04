import { IMessageSubscriber } from './interfaces/IMessageSubscriber';
import { Service } from 'typedi';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';

@Service()
export class MessageSubscriberRegistry {
  constructor(private messageBus: IMessageBus) {}

  register(...messageSubscribers: IMessageSubscriber[]): void {
    messageSubscribers.forEach(subscriber => subscriber.register(this.messageBus));
  }
}
