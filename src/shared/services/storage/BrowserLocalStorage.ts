import { ContainerInstance, Service } from 'typedi';
import { Observable } from 'rxjs';
import { FrameIdentifier } from '../message-bus/FrameIdentifier';
import { ParentFrameStorage } from './ParentFrameStorage';
import { StoreBasedStorage } from './StoreBasedStorage';
import { IStorage } from './IStorage';
import { isSynchronized } from './ISynchronizedStorage';

@Service()
export class BrowserLocalStorage implements IStorage {
  private readonly storage: IStorage;

  constructor(private identifier: FrameIdentifier, private container: ContainerInstance) {
    this.storage = identifier.isParentFrame() ? this.container.get(ParentFrameStorage) : this.container.get(StoreBasedStorage);
  }

  init(): void {
    if (isSynchronized(this.storage)) {
      this.storage.initSynchronization();
    }
  }

  getItem(name: string): unknown {
    return this.storage.getItem(name);
  }

  setItem(name: string, value: unknown): void {
    this.storage.setItem(name, value);
  }

  select<T>(selector: (storage: { [p: string]: unknown }) => T): Observable<T> {
    return this.storage.select(selector);
  }
}
