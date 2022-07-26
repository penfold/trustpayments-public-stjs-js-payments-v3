import { fromEventPattern, Observable, Subscribable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { ofType } from '../message-bus/operators/ofType';
import { FramesHub } from '../message-bus/FramesHub';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { FrameIdentifier } from '../message-bus/FrameIdentifier';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IStorage } from './IStorage';

export abstract class AbstractStorage implements IStorage, Subscribable<unknown> {
  private static readonly STORAGE_EVENT = 'storage';
  readonly pipe: Observable<unknown>['pipe'];
  readonly subscribe: Observable<unknown>['subscribe'];
  private readonly observable$: Observable<Record<string, unknown>>;

  protected constructor(
    private nativeStorage: Storage,
    private communicator: InterFrameCommunicator,
    private framesHub: FramesHub,
    private identifier: FrameIdentifier
  ) {
    this.observable$ = fromEventPattern(
      handler => window.addEventListener(AbstractStorage.STORAGE_EVENT, handler, true),
      handler => window.removeEventListener(AbstractStorage.STORAGE_EVENT, handler)
    ).pipe(
      startWith({ ...this.nativeStorage }),
      map(() => ({ ...this.nativeStorage })),
      shareReplay(1)
    );
    this.pipe = this.observable$.pipe.bind(this.observable$);
    this.subscribe = this.observable$.subscribe.bind(this.observable$);

    this.communicator.incomingEvent$.pipe(ofType(this.getSychronizationEventName())).subscribe((event: IMessageBusEvent<{ key: string; value: string; }>) => {
      const { key, value } = event.data;
      this.nativeStorage.setItem(key, value);
      this.emitStorageEvent();
    });
  }

  getItem(name: string): string {
    return this.nativeStorage.getItem(name);
  }

  setItem(name: string, value: string, synchronize = true): void {
    this.nativeStorage.setItem(name, value);
    this.emitStorageEvent();

    if (synchronize) {
      this.synchronizeStorage(name, value);
    }
  }

  select<T>(selector: (storage: { [key: string]: unknown }) => T): Observable<T> {
    return this.observable$.pipe(
      map(storage => selector(storage)),
      shareReplay(1)
    );
  }

  protected abstract getSychronizationEventName(): string;

  private emitStorageEvent(): void {
    let event: Event;

    try {
      event = document.createEvent('StorageEvent');
    } catch (e) {
      event = document.createEvent('customevent');
    }

    event.initEvent(AbstractStorage.STORAGE_EVENT, true, true);
    window.dispatchEvent(event);
  }

  private synchronizeStorage(key: string, value: string): void {
    const event: IMessageBusEvent = {
      type: this.getSychronizationEventName(),
      data: { key, value },
    };

    if (!this.identifier.isParentFrame()) {
      return this.communicator.send(event, MERCHANT_PARENT_FRAME);
    }

    this.framesHub
      .waitForFrame(CONTROL_FRAME_IFRAME)
      .subscribe(controlFrame => this.communicator.send(event, controlFrame));
  }
}
