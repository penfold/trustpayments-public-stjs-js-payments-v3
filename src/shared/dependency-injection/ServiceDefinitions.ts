import { Container } from 'typedi';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { MessageBusFactory } from '../../application/core/shared/message-bus/MessageBusFactory';
import { ApplePayReducer } from '../../application/core/store/reducers/apple-pay/ApplePayReducer';
import { MessageBusToken, StoreToken } from './InjectionTokens';
import { IStore } from '../../application/core/store/IStore';
import { StoreFactory } from '../../application/core/store/StoreFactory';
import { ConfigReducer } from '../../application/core/store/reducers/config/ConfigReducer';
import { StorageReducer } from '../../application/core/store/reducers/storage/StorageReducer';
import { IApplePaySessionWrapper } from '../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySessionWrapper';
import { ApplePaySessionWrapper } from '../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionWrapper';

Container.set({ id: IMessageBus, factory: [MessageBusFactory, 'create'] });
Container.set({ id: MessageBusToken, factory: [MessageBusFactory, 'create'] });
Container.set({ id: IStore, factory: [StoreFactory, 'create'] });
Container.set({ id: StoreToken, factory: [StoreFactory, 'create'] });
Container.set({ id: IApplePaySessionWrapper, type: ApplePaySessionWrapper });
Container.import([ConfigReducer, StorageReducer, ApplePayReducer]);
