import { IStore } from '../IStore';
import { BehaviorSubject, Observable, Unsubscribable } from 'rxjs';
import { map } from 'rxjs/operators';

export class TestStore<T = Record<string, unknown>> implements IStore<T> {
  constructor(private state$: BehaviorSubject<T>) {}

  getState(): T {
    return this.state$.getValue();
  }

  setState(state: T): void {
    this.state$.next(state);
  }

  select<U>(selector: (state: T) => U): Observable<U> {
    return this.state$.pipe(map(selector));
  }

  subscribe(observer: (state: T) => unknown): Unsubscribable {
    return this.state$.subscribe(observer);
  }
}
