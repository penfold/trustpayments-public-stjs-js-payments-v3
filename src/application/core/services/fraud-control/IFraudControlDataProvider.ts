import { Observable } from 'rxjs';

export interface IFraudControlDataProvider<T> {
  init(initData: T): Observable<void>;
  getTransactionId(): Observable<string | null>;
}
