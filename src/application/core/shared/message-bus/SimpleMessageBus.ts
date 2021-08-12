import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { Observable, Subject, Unsubscribable } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { map } from 'rxjs/operators';
import { Service } from 'typedi';
import { IMessageBus } from './IMessageBus';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';

@Service()
export class SimpleMessageBus extends Subject<IMessageBusEvent> implements IMessageBus, Observable<IMessageBusEvent> {
  constructor(message$?: Observable<IMessageBusEvent>) {
    super();
    if (message$) {
      message$.subscribe(this);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  publish<T>(event: IMessageBusEvent<T>, publishToParent?: boolean): void {
    this.next(event);
  }

  subscribeType<T>(eventType: string, callback: (data: T) => void): Unsubscribable {
    return this.pipe(
      ofType(eventType),
      map((event: IMessageBusEvent<T>) => event.data)
    ).subscribe(callback);
  }

  protected isPublic(event: IMessageBusEvent): boolean {
    return Object.values(PUBLIC_EVENTS).includes(event.type);
  }
}
