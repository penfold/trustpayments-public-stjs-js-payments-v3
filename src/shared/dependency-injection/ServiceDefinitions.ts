import { Container } from 'typedi';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { MessageBusFactory } from '../../application/core/shared/message-bus/MessageBusFactory';
import { MessageBusToken, StoreToken } from './InjectionTokens';
import { IStore } from '../../application/core/store/IStore';
import { StoreFactory } from '../../application/core/store/StoreFactory';
import { ConfigReducer } from '../../application/core/store/reducers/config/ConfigReducer';
import { StorageReducer } from '../../application/core/store/reducers/storage/StorageReducer';

Container.set({ id: IMessageBus, factory: [MessageBusFactory, 'create'] });
Container.set({ id: MessageBusToken, factory: [MessageBusFactory, 'create'] });
Container.set({ id: IStore, factory: [StoreFactory, 'create'] });
Container.set({ id: StoreToken, factory: [StoreFactory, 'create'] });
Container.import([ConfigReducer, StorageReducer]);
