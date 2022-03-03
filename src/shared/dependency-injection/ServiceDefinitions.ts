import { ContainerInstance } from 'typedi';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { MessageBusFactory } from '../../application/core/shared/message-bus/MessageBusFactory';
import { ApplePayReducer } from '../../application/core/store/reducers/apple-pay/ApplePayReducer';
import { InitialConfigReducer } from '../../application/core/store/reducers/initial-config/InitialConfigReducer';
import { IStore } from '../../application/core/store/IStore';
import { StoreFactory } from '../../application/core/store/StoreFactory';
import { ConfigReducer } from '../../application/core/store/reducers/config/ConfigReducer';
import { StorageReducer } from '../../application/core/store/reducers/storage/StorageReducer';
import { LocaleSubscriber } from '../../application/core/shared/translator/LocaleSubscriber';
import { ITranslationProvider } from '../../application/core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../application/core/shared/translator/TranslationProvider';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { TranslatorWithMerchantTranslations } from '../../application/core/shared/translator/TranslatorWithMerchantTranslations';
import { IFrameQueryingService } from '../services/message-bus/interfaces/IFrameQueryingService';
import { FrameQueryingService } from '../services/message-bus/FrameQueryingService';
import { MessageBusToken, MessageSubscriberToken, ReducerToken, StoreToken, TranslatorToken } from './InjectionTokens';

export const initializeContainer = (container: ContainerInstance) => {

  container.set({ id: IMessageBus, factory: [MessageBusFactory, 'create'] });
  container.set({ id: MessageBusToken, factory: [MessageBusFactory, 'create'] });
  container.set({ id: IStore, factory: [StoreFactory, 'create'] });
  container.set({ id: StoreToken, factory: [StoreFactory, 'create'] });
  container.set({ id: ITranslationProvider, type: TranslationProvider });
  container.set({ id: ITranslator, type: TranslatorWithMerchantTranslations });
  container.set({ id: TranslatorToken, type: TranslatorWithMerchantTranslations });
  container.set({ id: IFrameQueryingService, type: FrameQueryingService });
  container.set({ id: ReducerToken, type: ConfigReducer, multiple: true });
  container.set({ id: ReducerToken, type: StorageReducer, multiple: true });
  container.set({ id: ReducerToken, type: ApplePayReducer, multiple: true });
  container.set({ id: ReducerToken, type: InitialConfigReducer, multiple: true });
  container.set({ id: MessageSubscriberToken, type: LocaleSubscriber, multiple: true });
};
