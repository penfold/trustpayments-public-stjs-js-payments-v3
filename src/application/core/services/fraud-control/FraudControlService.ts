import { Service } from 'typedi';
import { catchError, Observable, of, switchMap, timeout, TimeoutError } from 'rxjs';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { RequestTimeoutError } from '../../../../shared/services/sentry/RequestTimeoutError';
import { TimeoutDetailsType } from '../../../../shared/services/sentry/RequestTimeout';
import { environment } from '../../../../environments/environment';
import { FraudControlServiceSelector } from './FraudControlServiceSelector';

@Service()
export class FraudControlService {
  constructor(private fraudControlServiceSelector: FraudControlServiceSelector, private sentryService: SentryService) {
  }

  getTransactionId(): Observable<string | null> {
    return this.fraudControlServiceSelector.getFraudControlDataProvider().pipe(
      switchMap(fraudControlDataProvider => fraudControlDataProvider.getTransactionId()),
      timeout(environment.FRAUD_CONTROL_TIMEOUT),
      catchError(err => {
        this.reportError(err);

        return of(null);
      }),
    );
  }

  private reportError(err: Error): void {
    if (err instanceof TimeoutError) {
      this.sentryService.sendCustomMessage(
        new RequestTimeoutError('Failed to retrieve fraud control data', {
          type: TimeoutDetailsType.THIRD_PARTY_API,
          originalError: err,
        })
      );
      return;
    }

    this.sentryService.sendCustomMessage(err);
  }
}
