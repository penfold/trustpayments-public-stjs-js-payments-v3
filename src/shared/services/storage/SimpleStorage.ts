import { Service } from 'typedi';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IStorage } from './IStorage';

interface StorageData {
  [index: string]: unknown;
}

@Service()
export class SimpleStorage implements IStorage {
  private storage$: BehaviorSubject<StorageData> = new BehaviorSubject({});

  getItem(name: string): unknown {
    return this.storage$.getValue()[name];
  }

  setItem(name: string, value: unknown): void {
    const storage = this.storage$.getValue();
    this.storage$.next({ ...storage, [name]: value });
  }

  select<T>(selector: (storage: { [p: string]: unknown }) => T): Observable<T> {
    return this.storage$.pipe(map(selector));
  }
}
