import { Service } from 'typedi';
import { FraudControlServiceSelector } from './FraudControlServiceSelector';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Service()
export class FraudControlService {
  constructor(private fraudControlServiceSelector: FraudControlServiceSelector) {
  }

  getTransactionId(): Observable<string | null> {
    return this.fraudControlServiceSelector.getFraudControlDataProvider().pipe(
      switchMap(fraudControlDataProvider => fraudControlDataProvider.getTransactionId()),
      catchError(() => of(null)),
    );
  }
}
