import { ContainerInstance } from 'typedi';
import { BehaviorSubject } from 'rxjs';
import { SimpleMessageBus } from '../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../application/core/shared/message-bus/IMessageBus';
import { ConfigProviderToken, MessageBusToken, StoreToken } from '../shared/dependency-injection/InjectionTokens';
import { IStore } from '../application/core/store/IStore';
import { Store } from '../application/core/store/store/Store';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { ConfigProvider } from '../shared/services/config-provider/ConfigProvider';
import { IHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/IHttpOptionsProvider';
import { DefaultHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/DefaultHttpOptionsProvider';
import { ITranslator } from '../application/core/shared/translator/ITranslator';
import { TranslatorWithMerchantTranslations } from '../application/core/shared/translator/TranslatorWithMerchantTranslations';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { TestConfigProvider } from './mocks/TestConfigProvider';

const messageBus: IMessageBus = new SimpleMessageBus();
const configProvider: ConfigProvider = new TestConfigProvider();
const store: IStore<unknown> = new Store(
  new BehaviorSubject<unknown>({}),
  messageBus,
);

export const initializeContainerServiceDefinition = (container: ContainerInstance) => {

  container.set({ id: IMessageBus, value: messageBus });
  container.set({ id: MessageBusToken, value: messageBus });
  container.set({ id: IStore, value: store });
  container.set({ id: StoreToken, value: store });
  container.set({ id: Cybertonica, type: CybertonicaMock });
  container.set({ id: ConfigProvider, value: configProvider });
  container.set({ id: ConfigProviderToken, value: configProvider });
  container.set({ id: IHttpOptionsProvider, type: DefaultHttpOptionsProvider });
  container.set({ id: ITranslator, type: TranslatorWithMerchantTranslations });
};

