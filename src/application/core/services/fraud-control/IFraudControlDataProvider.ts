import { Observable } from 'rxjs';

export interface IFraudControlDataProvider {
  init(): Observable<void>;
  getTransactionId(): Observable<string | null>;
}
