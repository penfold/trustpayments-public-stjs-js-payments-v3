import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';

export function ofType<T extends IMessageBusEvent>(type: string) {
  return (source: Observable<T>): Observable<T> => source.pipe(filter(event => event.type === type));
}
