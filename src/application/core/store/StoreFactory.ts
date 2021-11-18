import { ContainerInstance, Service } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { IParentFrameState } from './state/IParentFrameState';
import { IApplicationFrameState } from './state/IApplicationFrameState';
import { LinkedStore } from './store/LinkedStore';
import { IStore } from './IStore';
import { ParentFrameStore } from './store/ParentFrameStore';
import { ControlFrameStore } from './store/ControlFrameStore';
import { CombinedReducerFactory } from './CombinedReducerFactory';

@Service()
export class StoreFactory {
  constructor(
    private frameIdentifier: FrameIdentifier,
    private container: ContainerInstance,
    private reducerFactory: CombinedReducerFactory
  ) {}

  create(): IStore<IParentFrameState | IApplicationFrameState> {
    if (this.frameIdentifier.isParentFrame()) {
      return this.withCombinedReducer(this.container.get(ParentFrameStore));
    }

    if (this.frameIdentifier.isControlFrame()) {
      return this.withCombinedReducer(this.container.get(ControlFrameStore));
    }

    return this.container.get(LinkedStore);
  }

  private withCombinedReducer<T extends ParentFrameStore | ControlFrameStore>(store: T): T {
    store.addReducer(this.reducerFactory.getCombinedReducer());

    return store;
  }
}
