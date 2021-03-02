import { IStore } from '../IStore';
import { BehaviorSubject, Observable, Unsubscribable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Service } from 'typedi';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IReducer } from '../IReducer';

@Service()
export class Store<T> implements IStore<T> {
  private reducers: IReducer<T>[] = [];

  constructor(protected state$: BehaviorSubject<T>, private messageBus: IMessageBus) {
    this.messageBus
      .pipe(
        map(message =>
          this.reducers.reduce(
            (currentState: T, reducer: IReducer<T>) => reducer.reduce(currentState, message),
            this.getState()
          )
        ),
        distinctUntilChanged()
      )
      .subscribe(this.state$);
  }

  getState(): T {
    return this.state$.getValue();
  }

  select<U>(selector: (state: T) => U): Observable<U> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  subscribe(observer: (state: T) => any): Unsubscribable {
    return this.state$.subscribe(observer);
  }

  addReducer(reducer: IReducer<T>): void {
    this.reducers.push(reducer);
  }
}
