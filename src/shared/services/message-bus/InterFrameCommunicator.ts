import { ContainerInstance, Inject, Service } from 'typedi';
import { filter, map, share, defer, fromEvent, Observable, Subject } from 'rxjs';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { environment } from '../../../environments/environment';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { FrameAccessor } from './FrameAccessor';
import { FrameNotFound } from './errors/FrameNotFound';
import { Debug } from '../../Debug';
import { CONFIG, WINDOW } from '../../dependency-injection/InjectionTokens';
import { IConfig } from '../../model/config/IConfig';
import { EventDataSanitizer } from './EventDataSanitizer';
import { FrameQueryingService, WhenReceive } from './FrameQueryingService';

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
    private frameQueryingService: FrameQueryingService,
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
    this.frameQueryingService.attach(this);
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

  query<T>(message: IMessageBusEvent, target: Window | string): Promise<T> {
    return this.frameQueryingService.query(message, target);
  }

  whenReceive<T>(eventType: string): WhenReceive<T> {
    return this.frameQueryingService.whenReceive<T>(eventType);
  }

  close(): void {
    this.close$.next();
    this.frameQueryingService.detach();
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
