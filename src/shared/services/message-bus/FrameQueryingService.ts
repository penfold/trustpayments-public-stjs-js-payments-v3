import {
  catchError,
  EMPTY,
  filter,
  first,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import { Service } from 'typedi';
import { take } from 'rxjs/operators';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { InterFrameCommunicator } from './InterFrameCommunicator';
import { QueryMessage } from './messages/QueryMessage';
import { ofType } from './operators/ofType';
import { ResponseMessage } from './messages/ResponseMessage';
import { FrameIdentifier } from './FrameIdentifier';
import { ErrorReconstructor } from './ErrorReconstructor';
import { QueryResponder } from './types/QueryResponder';
import { IFrameQueryingService } from './interfaces/IFrameQueryingService';

@Service()
export class FrameQueryingService implements IFrameQueryingService {
  private interFrameCommunicator: InterFrameCommunicator;
  private responders: Map<string, QueryResponder> = new Map();
  private detach$: Subject<void> = new Subject();

  constructor(
    private frameIdentifier: FrameIdentifier,
    private errorReconstructor: ErrorReconstructor,
  ) {
  }

  attach(interFrameCommunicator: InterFrameCommunicator): void {
    this.interFrameCommunicator = interFrameCommunicator;
    this.beginListeningForQueries();
  }

  detach(): void {
    this.detach$.next();
    this.interFrameCommunicator = null;
    this.responders.clear();
  }

  query<T>(message: IMessageBusEvent, target: Window | string): Observable<T> {
    if (!this.interFrameCommunicator) {
      throw new Error('Frame querying is not available - service is in a detached state.');
    }

    return new Observable<T>(observer => {
      const sourceFrame = this.frameIdentifier.getFrameName() || MERCHANT_PARENT_FRAME;
      const queryMessage = new QueryMessage(message, sourceFrame);

      this.interFrameCommunicator.incomingEvent$
        .pipe(
          ofType(ResponseMessage.MESSAGE_TYPE),
          filter((event: ResponseMessage<T>) => event.queryId === queryMessage.queryId),
          switchMap((event: ResponseMessage<T>) => {
            if (!event.isError) {
              return of(event.data);
            }

            return throwError(() => this.errorReconstructor.reconstruct(event.data));
          }),
          takeUntil(this.detach$),
          take(1),
        )
        .subscribe(observer);

      this.interFrameCommunicator.send(queryMessage, target);
    });
  }

  whenReceive<T>(eventType: string, thenRespond: QueryResponder<T>): void {
    this.responders.set(eventType, thenRespond);
  }

  private beginListeningForQueries(): void {
    this.interFrameCommunicator.incomingEvent$
      .pipe(
        filter(event => event.type === QueryMessage.MESSAGE_TYPE),
        mergeMap((queryEvent: QueryMessage) => this.getQueryResponse(queryEvent)),
        takeUntil(this.detach$),
      )
      .subscribe((response: ResponseMessage<unknown>) => {
        this.interFrameCommunicator.send(response, response.queryFrame);
      });
  }

  private getQueryResponse(queryEvent: QueryMessage): Observable<unknown> {
    if (!this.responders.has(queryEvent.data.type)) {
      return EMPTY;
    }

    const responder: QueryResponder = this.responders.get(queryEvent.data.type);

    return responder(queryEvent.data).pipe(
      first(),
      map(response => new ResponseMessage(response, queryEvent.queryId, queryEvent.sourceFrame, false)),
      catchError(error => of(new ResponseMessage(error, queryEvent.queryId, queryEvent.sourceFrame, true))),
    );
  }
}
