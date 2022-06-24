import { anyOfClass, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { NEVER, Observable, of, throwError, TimeoutError } from 'rxjs';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { RequestTimeoutError } from '../../../../shared/services/sentry/errors/RequestTimeoutError';
import { environment } from '../../../../environments/environment';
import { FraudControlService } from './FraudControlService';
import { FraudControlServiceSelector } from './FraudControlServiceSelector';
import { IFraudControlDataProvider } from './IFraudControlDataProvider';

describe('FraudControlService', () => {
  const TID = '343d7850-5cfc-4f5a-b8d0-c06e6af3d556';
  let fraudControlServiceSelectorMock: FraudControlServiceSelector;
  let fraudControlDataProviderMock: IFraudControlDataProvider;
  let fraudControlService: FraudControlService;
  let sentryServiceMock: SentryService;

  beforeEach(() => {
    fraudControlServiceSelectorMock = mock(FraudControlServiceSelector);
    fraudControlDataProviderMock = mock<IFraudControlDataProvider>();
    sentryServiceMock = mock(SentryService);
    fraudControlService = new FraudControlService(
      instance(fraudControlServiceSelectorMock),
      instance(sentryServiceMock),
    );

    when(fraudControlServiceSelectorMock.getFraudControlDataProvider())
      .thenReturn(new Observable(observer => {
          observer.next(instance(fraudControlDataProviderMock));
          observer.complete();
      }));

    when(fraudControlDataProviderMock.getTransactionId()).thenReturn(of(TID));
  });

  describe('getTransactionId()', () => {
    it('returns fraud transaction id from data provider', done => {
      fraudControlService.getTransactionId().subscribe(tid => {
        expect(tid).toBe(TID);
        done();
      });
    });

    it('returns null if data provider selection fails', done => {
      when(fraudControlServiceSelectorMock.getFraudControlDataProvider())
        .thenReturn(throwError(() => new Error('failed')));

      fraudControlService.getTransactionId().subscribe(tid => {
        expect(tid).toBeNull();
        done();
      });
    });

    it('returns null when the provider exceeds timeout value', done => {
      // @ts-ignore
      when(spy(environment).FRAUD_CONTROL_TIMEOUT).thenReturn(10);

      when(fraudControlDataProviderMock.getTransactionId()).thenReturn(NEVER);

      fraudControlService.getTransactionId().subscribe(result => {
        expect(result).toBe(null);
        verify(sentryServiceMock.sendCustomMessage(
          deepEqual(new RequestTimeoutError('Failed to retrieve fraud control data', anyOfClass(TimeoutError))))
        ).once();
        done();
      });
    });

    it('reports the error to sentry when error occurs', done => {
      const error = new Error('failed');
      when(fraudControlDataProviderMock.getTransactionId()).thenReturn(throwError(() => error));

      fraudControlService.getTransactionId().subscribe(result => {
        expect(result).toBe(null);
        verify(sentryServiceMock.sendCustomMessage(error)).once();
        done();
      });
    });
  });
});
