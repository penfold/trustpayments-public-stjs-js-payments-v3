import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { QueryResponder } from './types/QueryResponder';
import { IFrameQueryingService } from './interfaces/IFrameQueryingService';

export class FrameQueryingServiceMock implements IFrameQueryingService {
  private responders: Map<string, QueryResponder> = new Map();

  query<T>(message: IMessageBusEvent, target: Window | string): Observable<T> {
    if (!this.responders.has(message.type)) {
      return EMPTY;
    }

    const responder = this.responders.get(message.type) as QueryResponder<T>;
    const responseSubject = new ReplaySubject<T>(1);

    responder(message)
      .pipe(take(1))
      .subscribe(responseSubject);

    return responseSubject.asObservable();
  }

  whenReceive<T>(eventType: string, thenRespond: QueryResponder<T>): void {
    this.responders.set(eventType, thenRespond);
  }
}
