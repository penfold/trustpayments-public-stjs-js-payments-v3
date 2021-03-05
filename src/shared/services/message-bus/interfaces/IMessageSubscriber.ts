import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';

export interface IMessageSubscriber {
  register(messageBus: IMessageBus): void;
}
