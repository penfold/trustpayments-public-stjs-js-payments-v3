import { InterFrameCommunicator } from './InterFrameCommunicator';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { QueryMessage } from './messages/QueryMessage';
import { ofType } from './operators/ofType';
import { ResponseMessage } from './messages/ResponseMessage';
import {
  catchError,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  EMPTY,
  Observable,
  of,
  Subject,
  throwError,
} from 'rxjs';
import { Service } from 'typedi';
import { FrameIdentifier } from './FrameIdentifier';
import { ErrorReconstructor } from './ErrorReconstructor';

type QueryResponder<T = unknown> = (queryEvent: IMessageBusEvent) => Observable<T>;

export interface WhenReceive<T = unknown> {
  thenRespond: (responder: QueryResponder<T>) => void;
}

@Service()
export class FrameQueryingService {
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

  query<T>(message: IMessageBusEvent, target: Window | string): Promise<T> {
    if (!this.interFrameCommunicator) {
      throw new Error('Frame querying is not available - service is in a detached state.');
    }

    return new Promise((resolve, reject) => {
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
        )
        .subscribe({
          next: result => resolve(result),
          error: error => reject(error),
        });

      this.interFrameCommunicator.send(queryMessage, target);
    });
  }

  whenReceive<T>(eventType: string): WhenReceive<T> {
    return {
      thenRespond: (responder: QueryResponder<T>) => {
        this.responders.set(eventType, responder);
      },
    };
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
