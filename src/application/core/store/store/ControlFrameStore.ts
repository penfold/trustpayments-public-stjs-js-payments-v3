import { Store } from './Store';
import { IApplicationFrameState } from '../state/IApplicationFrameState';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { Inject, Service } from 'typedi';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';
import { BehaviorSubject } from 'rxjs';
import { IControlFrameWindow } from '../../../../shared/interfaces/IControlFrameWindow';

@Service()
export class ControlFrameStore extends Store<IApplicationFrameState> {
  static readonly INITIAL_STATE: IApplicationFrameState = {
    storage: {}
  };

  constructor(messageBus: IMessageBus, @Inject(WINDOW) private window: IControlFrameWindow) {
    super(new BehaviorSubject<IApplicationFrameState>(ControlFrameStore.INITIAL_STATE), messageBus);
    this.window.stStore = this.state$;
  }
}
