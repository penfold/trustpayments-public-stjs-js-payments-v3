import { Observable } from 'rxjs';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';

export type QueryResponder<T = unknown> = (queryEvent: IMessageBusEvent) => Observable<T>;
