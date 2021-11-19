import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { IFraudControlDataProvider } from './IFraudControlDataProvider';

@Service()
export class DisabledFraudControlDataProvider implements IFraudControlDataProvider {
  init(): Observable<undefined> {
    return of(undefined);
  }

  getTransactionId(): Observable<string | null> {
    return of(null);
  }
}
