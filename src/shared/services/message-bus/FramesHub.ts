import { Service } from 'typedi';
import { BehaviorSubject, from, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, first, map, mapTo, withLatestFrom } from 'rxjs/operators';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { ArrayUtils } from '../../../application/core/shared/array-utils/ArrayUtils';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { FrameIdentifier } from './FrameIdentifier';
import { ofType } from './operators/ofType';
import { InterFrameCommunicator } from './InterFrameCommunicator';

@Service()
export class FramesHub {
  private static readonly FRAME_READY_EVENT = 'ST_FRAME_READY';
  private static readonly GET_FRAMES_EVENT = 'ST_GET_ACTIVE_FRAMES';
  private activeFrame$: Subject<string[]> = new BehaviorSubject([]);

  constructor(private communicator: InterFrameCommunicator, private identifier: FrameIdentifier) {}

  init(): void {
    this.communicator.whenReceive(FramesHub.GET_FRAMES_EVENT).thenRespond(() => this.activeFrame$);

    this.getInitialFrames().subscribe(value => this.activeFrame$.next(value));

    const fromEventFrame$ = this.communicator.incomingEvent$.pipe(
      ofType(FramesHub.FRAME_READY_EVENT),
      filter((event: IMessageBusEvent<string>) => Boolean(event.data)),
      map((event: IMessageBusEvent<string>) => event.data)
    );

    fromEventFrame$
      .pipe(
        withLatestFrom(this.activeFrame$),
        map(([newFrame, activeFrames]) => ArrayUtils.unique([...activeFrames, newFrame]))
      )
      .subscribe(this.activeFrame$);

    fromEventFrame$
      .pipe(withLatestFrom(this.activeFrame$))
      .subscribe(([newFrame, activeFrames]) => this.onFrameReady(newFrame, activeFrames));

    this.communicator.incomingEvent$
      .pipe(ofType(PUBLIC_EVENTS.DESTROY), mapTo([]))
      .subscribe(value => this.activeFrame$.next(value));
  }

  isFrameActive(name: string): Observable<boolean> {
    return this.activeFrame$.pipe(
      map(frames => frames.indexOf(name) !== -1),
      distinctUntilChanged()
    );
  }

  waitForFrame(name: string): Observable<string> {
    return this.isFrameActive(name).pipe(filter(Boolean), first(), mapTo(name));
  }

  notifyReadyState(): void {
    const frameName = this.identifier.getFrameName();

    if (frameName === MERCHANT_PARENT_FRAME) {
      return;
    }

    this.communicator.send({ type: FramesHub.FRAME_READY_EVENT, data: frameName }, MERCHANT_PARENT_FRAME);
  }

  getParentFrame(): Window {
    if (this.identifier.isParentFrame()) {
      return window;
    }

    return window.parent;
  }

  reset(): void {
    this.activeFrame$.next([]);
  }

  private getInitialFrames(): Observable<string[]> {
    if (this.identifier.isParentFrame()) {
      return of([]);
    }

    return from(this.communicator.query<string[]>({ type: FramesHub.GET_FRAMES_EVENT }, MERCHANT_PARENT_FRAME));
  }

  private onFrameReady(newFrame: string, activeFrames: string[]): void {
    if (!this.identifier.isParentFrame()) {
      return;
    }

    const event: IMessageBusEvent = {
      type: FramesHub.FRAME_READY_EVENT,
      data: newFrame,
    };

    activeFrames.forEach(frame => this.communicator.send(event, frame));
  }
}
