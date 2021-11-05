import { Service } from 'typedi';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { FramesHub } from '../message-bus/FramesHub';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ofType } from '../message-bus/operators/ofType';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IStorage } from './IStorage';
import { ISynchronizedStorage } from './ISynchronizedStorage';

interface StorageData {
  [index: string]: unknown;
}

@Service()
export class ParentFrameStorage implements IStorage, ISynchronizedStorage {
  private storage$: BehaviorSubject<StorageData> = new BehaviorSubject({});

  constructor(private interFrameCommunicator: InterFrameCommunicator, private framesHub: FramesHub) {}

  getItem(name: string): unknown {
    return this.storage$.getValue()[name];
  }

  setItem(name: string, value: unknown): void {
    this.setItemWithoutSync(name, value);
    this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).subscribe(controlFrame => {
      this.interFrameCommunicator.send(
        {
          type: PUBLIC_EVENTS.STORAGE_SYNC,
          data: { key: name, value: JSON.stringify(value) },
        },
        controlFrame
      );
    });
  }

  select<T>(selector: (storage: { [p: string]: unknown }) => T): Observable<T> {
    return this.storage$.pipe(map(selector));
  }

  initSynchronization(): void {
    this.interFrameCommunicator.incomingEvent$
      .pipe(ofType(PUBLIC_EVENTS.STORAGE_SYNC), takeUntil(this.interFrameCommunicator.communicationClosed$))
      .subscribe((event: IMessageBusEvent<{ key: string; value: string; }>) => {
        const { key, value } = event.data;
        this.setItemWithoutSync(key, this.parseEventData(value));
      });
  }

  private setItemWithoutSync(name: string, value: unknown): void {
    const storage = this.storage$.getValue();
    this.storage$.next({ ...storage, [name]: value });
  }

  private parseEventData(jsonData: string): unknown {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      return undefined;
    }
  }
}
