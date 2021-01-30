import { Container } from 'typedi';
import { SimpleMessageBus } from '../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../application/core/shared/message-bus/IMessageBus';
import { MessageBusToken, StoreToken } from '../shared/dependency-injection/InjectionTokens';
import { IStore } from '../application/core/store/IStore';
import { Store } from '../application/core/store/store/Store';
import { BehaviorSubject } from 'rxjs';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { CybertonicaMock } from './mocks/CybertonicaMock';

const storeFactory = () => {
  const state = new BehaviorSubject<any>({});
  const messageBus = Container.get(MessageBusToken);

  return new Store(state, messageBus);
};

Container.set({ id: IMessageBus, type: SimpleMessageBus });
Container.set({ id: MessageBusToken, type: SimpleMessageBus });
Container.set({ id: IStore, factory: storeFactory });
Container.set({ id: StoreToken, factory: storeFactory });
Container.set({ id: Cybertonica, type: CybertonicaMock });
