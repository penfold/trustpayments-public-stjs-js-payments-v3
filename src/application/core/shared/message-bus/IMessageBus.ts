import { Observable, OperatorFunction, Subscribable, PartialObserver, Unsubscribable } from 'rxjs';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { EventScope } from '../../models/constants/EventScope';

export abstract class IMessageBus implements Subscribable<IMessageBusEvent> {
  abstract publish<T>(event: IMessageBusEvent<T>, eventScope?: EventScope): void;
  abstract subscribeType<T>(eventType: string, callback: (data: T) => void): Unsubscribable;
  abstract subscribe<T extends IMessageBusEvent>(observer?: PartialObserver<T>): Unsubscribable;
  abstract subscribe<T extends IMessageBusEvent>(
    next?: (value: T) => void,
    error?: (error: unknown) => void,
    complete?: () => void
  ): Unsubscribable;
  // @todo(typings) Replacing any here would require us to add a generic parameter to that function and use it in all
  // places. Currently we at least in most cases type the arg that is passed to the next function, so it's not that bad.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract pipe(...operations: OperatorFunction<any, unknown>[]): Observable<any>;
}
