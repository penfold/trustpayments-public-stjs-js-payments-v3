import { Token } from 'typedi';
import { IConfig } from '../model/config/IConfig';
import { IMessageSubscriber } from '../services/message-bus/interfaces/IMessageSubscriber';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { IReducer } from '../../application/core/store/IReducer';
import { IStore } from '../../application/core/store/IStore';

export const WINDOW = new Token<Window>('window');
export const CONFIG = new Token<IConfig>('config');
export const MessageSubscriberToken = new Token<IMessageSubscriber>('message-subscriber');
export const MessageBusToken = new Token<IMessageBus>('message-bus');
export const ReducerToken = new Token<IReducer<any>>('reducer');
export const StoreToken = new Token<IStore<any>>('store');
