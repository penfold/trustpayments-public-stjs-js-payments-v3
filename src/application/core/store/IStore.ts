import { Observable } from 'rxjs';
import { Unsubscribable } from 'rxjs/src/internal/types';

export abstract class IStore<T> {
  abstract getState(): T;
  abstract select<U>(selector: (state: T) => U): Observable<U>;
  abstract subscribe(observer: (state: T) => any): Unsubscribable;
}
