import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { PreventNavigationPopup } from '../message-subscribers/PreventNavigationPopup';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { MessageBusFactory } from '../../application/core/shared/message-bus/MessageBusFactory';
import { MessageBusToken } from '../../shared/dependency-injection/InjectionTokens';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });
Container.set({ id: IMessageBus, factory: [MessageBusFactory, 'create'] });
Container.set({ id: MessageBusToken, factory: [MessageBusFactory, 'create'] });

Container.import([PreventNavigationPopup]);
