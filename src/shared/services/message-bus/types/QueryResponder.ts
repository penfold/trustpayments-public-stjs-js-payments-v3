import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { Observable } from 'rxjs';

export type QueryResponder<T = unknown> = (queryEvent: IMessageBusEvent) => Observable<T>;
