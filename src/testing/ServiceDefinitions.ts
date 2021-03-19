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

const storeFactory = () => {
  const state = new BehaviorSubject<any>({});
  const messageBus = Container.get(MessageBusToken);

  return new Store(state, messageBus);
};

const messageBus: IMessageBus = new SimpleMessageBus();
const configProvider: ConfigProvider = new TestConfigProvider();

Container.set({ id: IMessageBus, value: messageBus });
Container.set({ id: MessageBusToken, value: messageBus });
Container.set({ id: IStore, factory: storeFactory });
Container.set({ id: StoreToken, factory: storeFactory });
Container.set({ id: Cybertonica, type: CybertonicaMock });
Container.set({ id: ConfigProvider, value: configProvider });
Container.set({ id: ConfigProviderToken, value: configProvider });
