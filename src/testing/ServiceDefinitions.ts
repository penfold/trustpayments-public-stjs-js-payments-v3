import { Container } from 'typedi';
import { SimpleMessageBus } from '../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../application/core/shared/message-bus/IMessageBus';
import { ConfigProviderToken, MessageBusToken, StoreToken } from '../shared/dependency-injection/InjectionTokens';
import { IStore } from '../application/core/store/IStore';
import { Store } from '../application/core/store/store/Store';
import { BehaviorSubject } from 'rxjs';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { ConfigProvider } from '../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from './mocks/TestConfigProvider';
import { IHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/IHttpOptionsProvider';
import { DefaultHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/DefaultHttpOptionsProvider';
import { ITranslator } from '../application/core/shared/translator/ITranslator';
import { TranslatorWithMerchantTranslations } from '../application/core/shared/translator/TranslatorWithMerchantTranslations';

const messageBus: IMessageBus = new SimpleMessageBus();
const configProvider: ConfigProvider = new TestConfigProvider();
const store: IStore<unknown> = new Store(
  new BehaviorSubject<unknown>({}),
  messageBus,
);

Container.set({ id: IMessageBus, value: messageBus });
Container.set({ id: MessageBusToken, value: messageBus });
Container.set({ id: IStore, value: store });
Container.set({ id: StoreToken, value: store });
Container.set({ id: Cybertonica, type: CybertonicaMock });
Container.set({ id: ConfigProvider, value: configProvider });
Container.set({ id: ConfigProviderToken, value: configProvider });
Container.set({ id: IHttpOptionsProvider, type: DefaultHttpOptionsProvider });
Container.set({ id: ITranslator, type: TranslatorWithMerchantTranslations });
