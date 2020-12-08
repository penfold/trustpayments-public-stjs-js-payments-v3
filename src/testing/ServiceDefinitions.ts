import { Container } from 'typedi';
import { SimpleMessageBus } from '../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../application/core/shared/message-bus/IMessageBus';
import { MessageBusToken } from '../shared/dependency-injection/InjectionTokens';

Container.set({ id: IMessageBus, type: SimpleMessageBus });
Container.set({ id: MessageBusToken, type: SimpleMessageBus });
