import { IParentFrameState } from '../state/IParentFrameState';
import { Store } from './Store';
import { BehaviorSubject } from 'rxjs';
import { Service } from 'typedi';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';

@Service()
export class ParentFrameStore extends Store<IParentFrameState> {
  private static readonly INITIAL_STATE: IParentFrameState = {
    storage: {},
  };

  constructor(messageBus: IMessageBus) {
    super(new BehaviorSubject<IParentFrameState>(ParentFrameStore.INITIAL_STATE), messageBus);
  }
}
