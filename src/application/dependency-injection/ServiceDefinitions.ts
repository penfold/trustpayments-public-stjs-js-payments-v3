import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { StoreConfigProvider } from '../core/services/store-config-provider/StoreConfigProvider';
import { IMessageBus } from '../core/shared/message-bus/IMessageBus';
import { MessageBusFactory } from '../core/shared/message-bus/MessageBusFactory';
import { MessageBusToken } from '../../shared/dependency-injection/InjectionTokens';

Container.set({ id: ConfigProvider, type: StoreConfigProvider });
Container.set({ id: IMessageBus, factory: [MessageBusFactory, 'create'] });
Container.set({ id: MessageBusToken, factory: [MessageBusFactory, 'create'] });
