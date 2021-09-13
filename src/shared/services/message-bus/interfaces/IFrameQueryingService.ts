import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { Observable } from 'rxjs';
import { QueryResponder } from '../types/QueryResponder';
import { Service } from 'typedi';

@Service()
export abstract class IFrameQueryingService {
  abstract query<T>(message: IMessageBusEvent, target: Window | string): Observable<T>;
  abstract whenReceive<T>(eventType: string, thenRespond: QueryResponder<T>): void;
}
