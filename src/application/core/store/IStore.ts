import { Observable, Unsubscribable } from 'rxjs';

export abstract class IStore<T> {
  abstract getState(): T;
  abstract select<U>(selector: (state: T) => U): Observable<U>;
  abstract subscribe(observer: (state: T) => unknown): Unsubscribable;
}
