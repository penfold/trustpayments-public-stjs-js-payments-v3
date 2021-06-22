import { Observable } from 'rxjs';

export interface IStorage {
  getItem(name: string): unknown;
  setItem(name: string, value: unknown): void;
  select<T>(selector: (storage: { [key: string]: unknown }) => T): Observable<T>;
}
