import { BehaviorSubject, Observable, Unsubscribable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Service } from 'typedi';
import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { IApplicationFrameState } from '../state/IApplicationFrameState';
import { IStore } from '../IStore';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { ControlFrameStore } from './ControlFrameStore';

@Service()
export class LinkedStore implements IStore<IApplicationFrameState> {
  private store$: BehaviorSubject<IApplicationFrameState>;

  constructor(private frameAccessor: FrameAccessor, private framesHub: FramesHub) {
    this.store$ = new BehaviorSubject(ControlFrameStore.INITIAL_STATE);
    this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).subscribe(() => {
      this.frameAccessor.getControlFrame().stStore.subscribe(state => this.store$.next(state));
    });
  }

  getState(): IApplicationFrameState {
    return this.store$.getValue();
  }

  select<U>(selector: (state: IApplicationFrameState) => U): Observable<U> {
    return new Observable<U>(observer => this.store$.pipe(map(selector)).subscribe(observer));
  }

  subscribe(observer: (state: IApplicationFrameState) => unknown): Unsubscribable {
    return this.store$.subscribe(observer);
  }
}
