import { Observable } from 'rxjs';
import { Service } from 'typedi';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { QueryResponder } from '../types/QueryResponder';

@Service()
export abstract class IFrameQueryingService {
  abstract query<T>(message: IMessageBusEvent, target: Window | string): Observable<T>;
  abstract whenReceive<T>(eventType: string, thenRespond: QueryResponder<T>): void;
}
