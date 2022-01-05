import { Observable, takeUntil } from 'rxjs';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { ofType } from './ofType';

export function untilDestroy<T>(messageBus: IMessageBus) {
  return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY))));
}
