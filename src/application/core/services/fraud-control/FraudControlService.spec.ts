import { FraudControlService } from './FraudControlService';
import { FraudControlServiceSelector } from './FraudControlServiceSelector';
import { IFraudControlDataProvider } from './IFraudControlDataProvider';
import { instance, mock, when } from 'ts-mockito';
import { Observable, of, throwError } from 'rxjs';

describe('FraudControlService', () => {
  const TID = '343d7850-5cfc-4f5a-b8d0-c06e6af3d556';
  let fraudControlServiceSelectorMock: FraudControlServiceSelector;
  let fraudControlDataProviderMock: IFraudControlDataProvider<unknown>;
  let fraudControlService: FraudControlService;
  
  beforeEach(() => {
    fraudControlServiceSelectorMock = mock(FraudControlServiceSelector);
    fraudControlDataProviderMock = mock<IFraudControlDataProvider<unknown>>();
    fraudControlService = new FraudControlService(
      instance(fraudControlServiceSelectorMock),
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
  });
});