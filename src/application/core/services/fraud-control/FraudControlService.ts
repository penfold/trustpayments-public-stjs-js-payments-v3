import { Service } from 'typedi';
import { Observable, of, timeout } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FraudControlServiceSelector } from './FraudControlServiceSelector';

@Service()
export class FraudControlService {
  private static readonly TIMEOUT = 5000;

  constructor(private fraudControlServiceSelector: FraudControlServiceSelector) {
  }

  getTransactionId(): Observable<string | null> {
    return this.fraudControlServiceSelector.getFraudControlDataProvider().pipe(
      switchMap(fraudControlDataProvider => fraudControlDataProvider.getTransactionId()),
      timeout(FraudControlService.TIMEOUT),
      catchError(() => of(null)),
    );
  }
}
