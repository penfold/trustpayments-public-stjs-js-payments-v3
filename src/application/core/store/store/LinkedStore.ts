import { IStore } from '../IStore';
import { IApplicationFrameState } from '../state/IApplicationFrameState';
import { BehaviorSubject, Observable, Unsubscribable } from 'rxjs';
import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { map } from 'rxjs/operators';
import { Service } from 'typedi';

@Service()
export class LinkedStore implements IStore<IApplicationFrameState> {
  private store$: BehaviorSubject<IApplicationFrameState>;

  constructor(private frameAccessor: FrameAccessor) {
    this.store$ = frameAccessor.getControlFrame().stStore;
  }

  getState(): IApplicationFrameState {
    return this.store$.getValue();
  }

  select<U>(selector: (state: IApplicationFrameState) => U): Observable<U> {
    return new Observable<U>(observer => this.store$.pipe(map(selector)).subscribe(observer));
  }

  subscribe(observer: (state: IApplicationFrameState) => any): Unsubscribable {
    return this.store$.subscribe(observer);
  }
}
