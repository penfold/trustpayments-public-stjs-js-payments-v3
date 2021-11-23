import { Observable } from 'rxjs';

export interface IFraudControlDataProvider {
  init(): Observable<undefined>;
  getTransactionId(): Observable<string | null>;
}
