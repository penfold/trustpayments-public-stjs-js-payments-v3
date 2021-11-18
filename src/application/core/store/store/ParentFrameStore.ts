import { BehaviorSubject } from 'rxjs';
import { Service } from 'typedi';
import { IParentFrameState } from '../state/IParentFrameState';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { Store } from './Store';

@Service()
export class ParentFrameStore extends Store<IParentFrameState> {
  private static readonly INITIAL_STATE: IParentFrameState = {
    storage: {},
  };

  constructor(messageBus: IMessageBus) {
    super(new BehaviorSubject<IParentFrameState>(ParentFrameStore.INITIAL_STATE), messageBus);
  }
}
