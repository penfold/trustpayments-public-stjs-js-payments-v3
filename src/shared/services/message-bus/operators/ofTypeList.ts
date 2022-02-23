import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';

export function ofTypeList<T extends IMessageBusEvent>(types: string[]) {
  return (source: Observable<T>): Observable<T> => source.pipe(filter(event => types.includes(event.type)
  ));
}
