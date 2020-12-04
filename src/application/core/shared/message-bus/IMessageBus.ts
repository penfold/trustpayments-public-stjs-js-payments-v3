import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { PartialObserver, Unsubscribable } from 'rxjs/src/internal/types';
import { Observable, OperatorFunction, Subscribable } from 'rxjs';

export abstract class IMessageBus implements Subscribable<IMessageBusEvent> {
  abstract publish<T>(event: IMessageBusEvent<T>, publishToParent?: boolean): void;
  abstract subscribeType<T>(eventType: string, callback: (data: T) => void): Unsubscribable;
  abstract subscribe<T extends IMessageBusEvent>(observer?: PartialObserver<T>): Unsubscribable;
  abstract subscribe<T extends IMessageBusEvent>(
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Unsubscribable;
  abstract pipe(...operations: OperatorFunction<any, any>[]): Observable<any>;
}
