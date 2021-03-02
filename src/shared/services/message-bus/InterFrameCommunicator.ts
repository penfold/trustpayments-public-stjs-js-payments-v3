import { ContainerInstance, Inject, Service } from 'typedi';
import { defer, EMPTY, fromEvent, Observable, Subject } from 'rxjs';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { filter, first, map, mergeMap, share, take, takeUntil, tap } from 'rxjs/operators';
import { ofType } from './operators/ofType';
import { QueryMessage } from './messages/QueryMessage';
import { ResponseMessage } from './messages/ResponseMessage';
import { environment } from '../../../environments/environment';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameAccessor } from './FrameAccessor';
import { FrameNotFound } from './errors/FrameNotFound';
import { Debug } from '../../Debug';
import { CONFIG, WINDOW } from '../../dependency-injection/InjectionTokens';
import { IConfig } from '../../model/config/IConfig';

@Service()
export class InterFrameCommunicator {
  private static readonly MESSAGE_EVENT = 'message';
  private static readonly DEFAULT_ORIGIN = '*';
  public readonly incomingEvent$: Observable<IMessageBusEvent>;
  public readonly communicationClosed$: Observable<void> = defer(() => this.close$);
  private readonly close$ = new Subject<void>();
  private readonly frameOrigin: string;
  private parentOrigin: string;
  private responders: Map<string, (queryEvent: IMessageBusEvent) => Observable<any>> = new Map();

  constructor(
    private identifier: FrameIdentifier,
    private frameAccessor: FrameAccessor,
    private container: ContainerInstance,
    @Inject(WINDOW) private window: Window
  ) {
    this.incomingEvent$ = fromEvent<MessageEvent>(this.window, InterFrameCommunicator.MESSAGE_EVENT).pipe(
      filter(event => event.data.type),
      map(event => event.data),
      share()
    );

    this.frameOrigin = new URL(environment.FRAME_URL).origin;
    this.communicationClosed$.subscribe(() => this.responders.clear());
  }

  public init(): void {
    this.incomingEvent$
      .pipe(
        filter(event => event.type === QueryMessage.MESSAGE_TYPE),
        mergeMap((queryEvent: QueryMessage) => {
          if (!this.responders.has(queryEvent.data.type)) {
            return EMPTY;
          }

          return this.responders
            .get(queryEvent.data.type)(queryEvent.data)
            .pipe(
              first(),
              map(response => new ResponseMessage(response, queryEvent.queryId, queryEvent.sourceFrame))
            );
        }),
        takeUntil(this.communicationClosed$)
      )
      .subscribe((response: ResponseMessage<any>) => {
        this.send(response, response.queryFrame);
      });
  }

  public send(message: IMessageBusEvent, target: Window | string): void {
    try {
      const parentFrame = this.frameAccessor.getParentFrame();
      const targetFrame = this.resolveTargetFrame(target);
      const frameOrigin = targetFrame === parentFrame ? this.getParentOrigin() : this.frameOrigin;

      targetFrame.postMessage(message, frameOrigin);
    } catch (e) {
      if (e instanceof FrameNotFound) {
        return Debug.warn(e.message);
      }

      throw e;
    }
  }

  public query<T>(message: IMessageBusEvent, target: Window | string): Promise<T> {
    return new Promise((resolve, reject) => {
      const sourceFrame = this.identifier.getFrameName() || MERCHANT_PARENT_FRAME;
      const query = new QueryMessage(message, sourceFrame);

      this.incomingEvent$
        .pipe(
          ofType(ResponseMessage.MESSAGE_TYPE),
          filter((event: ResponseMessage<T>) => event.queryId === query.queryId),
          map((event: ResponseMessage<T>) => event.data),
          take(1),
          takeUntil(this.communicationClosed$)
        )
        .subscribe({
          next(result) {
            resolve(result);
          },
          error(error) {
            reject(error);
          }
        });

      this.send(query, target);
    });
  }

  public whenReceive(eventType: string) {
    return {
      thenRespond: <T>(responder: (queryEvent: IMessageBusEvent) => Observable<T>) => {
        this.responders.set(eventType, responder);
      }
    };
  }

  public close(): void {
    this.close$.next();
  }

  public sendToParentFrame(event: IMessageBusEvent): void {
    this.send(event, MERCHANT_PARENT_FRAME);
  }

  public sendToControlFrame(event: IMessageBusEvent): void {
    this.send(event, CONTROL_FRAME_IFRAME);
  }

  private resolveTargetFrame(target: Window | string): Window {
    if (target instanceof Window) {
      return target;
    }

    if (target === MERCHANT_PARENT_FRAME) {
      return this.frameAccessor.getParentFrame();
    }

    return this.frameAccessor.getFrame(target);
  }

  private getParentOrigin(): string {
    if (this.parentOrigin) {
      return this.parentOrigin;
    }

    if (!this.container.has(CONFIG)) {
      return InterFrameCommunicator.DEFAULT_ORIGIN;
    }

    const config: IConfig = this.container.get(CONFIG);

    this.parentOrigin = config.origin || InterFrameCommunicator.DEFAULT_ORIGIN;

    return this.parentOrigin;
  }
}
