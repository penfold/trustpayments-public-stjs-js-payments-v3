import { IErrorHandler } from '../IErrorHandler';
import { Service } from 'typedi';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { switchMap, tap } from 'rxjs/operators';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { Observable, of, throwError } from 'rxjs';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';

@Service()
export class HideProcessingScreenErrorHandler implements IErrorHandler {
  constructor(private messageBus: IMessageBus) {
  }

  handle(error: unknown, requestData: IStRequest, options: IRequestProcessingOptions): Observable<never> {
    const timer = options.timer || of(undefined);

    return timer.pipe(
      tap(() => this.messageBus.publish({
        type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
      }, true)),
      switchMap(() => throwError(() => error)),
    );
  }
}
