import { IFraudControlDataProvider } from '../../services/fraud-control/IFraudControlDataProvider';
import { Observable, of } from 'rxjs';
import { Service } from 'typedi';

@Service()
export class Seon implements IFraudControlDataProvider<undefined> {
  init(): Observable<void> {
    return of(undefined);
  }

  getTransactionId(): Observable<string> {
    return of('');
  }
}
