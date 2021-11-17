import { ContainerInstance, Inject, Service } from 'typedi';
import { filter, map, share, defer, fromEvent, Observable, Subject, firstValueFrom } from 'rxjs';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { environment } from '../../../environments/environment';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { Debug } from '../../Debug';
import { CONFIG, WINDOW } from '../../dependency-injection/InjectionTokens';
import { IConfig } from '../../model/config/IConfig';
import { FrameNotFound } from './errors/FrameNotFound';
import { FrameAccessor } from './FrameAccessor';
import { EventDataSanitizer } from './EventDataSanitizer';
import { IFrameQueryingService } from './interfaces/IFrameQueryingService';
import { FrameQueryingService } from './FrameQueryingService';

@Service()
export class InterFrameCommunicator {
  private static readonly MESSAGE_EVENT = 'message';
  private static readonly DEFAULT_ORIGIN = '*';
  readonly incomingEvent$: Observable<IMessageBusEvent>;
  readonly communicationClosed$: Observable<void> = defer(() => this.close$);
  private readonly close$ = new Subject<void>();
  private readonly frameOrigin: string;
  private parentOrigin: string;

  constructor(
    private frameAccessor: FrameAccessor,
    private container: ContainerInstance,
    private eventDataSanitizer: EventDataSanitizer,
    private frameQueryingService: IFrameQueryingService,
    @Inject(WINDOW) private window: Window
  ) {
    this.incomingEvent$ = fromEvent<MessageEvent>(this.window, InterFrameCommunicator.MESSAGE_EVENT).pipe(
      filter(event => event.data && event.data.type),
      map(event => event.data),
      share(),
    );

    this.frameOrigin = new URL(environment.FRAME_URL).origin;
  }

  init(): void {
    (this.frameQueryingService as FrameQueryingService).attach(this);
  }

  send(message: IMessageBusEvent, target: Window | string): void {
    try {
      const parentFrame = this.frameAccessor.getParentFrame();
      const targetFrame = this.resolveTargetFrame(target);
      const frameOrigin = targetFrame === parentFrame ? this.getParentOrigin() : this.frameOrigin;
      const sanitizedMessage: IMessageBusEvent = { ...message, data: this.eventDataSanitizer.sanitize(message.data) };

      targetFrame.postMessage(sanitizedMessage, frameOrigin);
    } catch (e) {
      if (e instanceof FrameNotFound) {
        return Debug.warn(e.message);
      }

      throw e;
    }
  }

  /** @deprecated use FrameQueryingService.query() instead **/
  query<T>(message: IMessageBusEvent, target: Window | string): Promise<T> {
    return firstValueFrom(this.frameQueryingService.query(message, target));
  }

  /** @deprecated use FrameQueryingService.whenReceive() instead **/
  whenReceive<T>(eventType: string): { thenRespond: ((responder: (queryEvent: IMessageBusEvent) => Observable<T>) => void) } {
    return {
      thenRespond: (responder => this.frameQueryingService.whenReceive<T>(eventType, responder)),
    };
  }

  close(): void {
    this.close$.next();
    (this.frameQueryingService as FrameQueryingService).detach();
  }

  sendToParentFrame(event: IMessageBusEvent): void {
    this.send(event, MERCHANT_PARENT_FRAME);
  }

  sendToControlFrame(event: IMessageBusEvent): void {
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
