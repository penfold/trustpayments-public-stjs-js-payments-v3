import { Token } from 'typedi';
import { IConfig } from '../model/config/IConfig';
import { IMessageSubscriber } from '../services/message-bus/interfaces/IMessageSubscriber';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { IReducer } from '../../application/core/store/IReducer';
import { IStore } from '../../application/core/store/IStore';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { ConfigProvider } from '../services/config-provider/ConfigProvider';

export const WINDOW = new Token<Window>('window');
export const CONFIG = new Token<IConfig>('config');
export const MessageSubscriberToken = new Token<IMessageSubscriber>('message-subscriber');
export const MessageBusToken = new Token<IMessageBus>('message-bus');
export const ReducerToken = new Token<IReducer<any>>('reducer');
export const StoreToken = new Token<IStore<any>>('store');
export const TranslatorToken = new Token<ITranslator>('translator');
export const ConfigProviderToken = new Token<ConfigProvider>('config-provider');
