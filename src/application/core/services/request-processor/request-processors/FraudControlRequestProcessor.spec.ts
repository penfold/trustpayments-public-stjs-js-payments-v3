import { mock, instance, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IStRequest } from '../../../models/IStRequest';
import { FraudControlService } from '../../fraud-control/FraudControlService';
import { FraudControlRequestProcessor } from './FraudControlRequestProcessor';

describe('FraudControlRequestProcessor', () => {
  let fraudControlServiceMock: FraudControlService;
  let fraudControlRequestProcessor: FraudControlRequestProcessor;

  beforeEach(() => {
    fraudControlServiceMock = mock(FraudControlService);
    fraudControlRequestProcessor = new FraudControlRequestProcessor(
      instance(fraudControlServiceMock),
    );
  });

  describe('process()', () => {
    const request: IStRequest = { pan: '1111111111111111' };

    it('should add fraudcontroltransactionid field with cybertonica tid', done => {
      when(fraudControlServiceMock.getTransactionId()).thenReturn(of('foobar1234'));

      fraudControlRequestProcessor.process(request).subscribe(result => {
        expect(result).toEqual({ ...request, fraudcontroltransactionid: 'foobar1234' });
        done();
      });
    });

    it('should not add fraudcontroltransactionid field when cybertonica tid is empty', done => {
      when(fraudControlServiceMock.getTransactionId()).thenReturn(of(null));

      fraudControlRequestProcessor.process(request).subscribe(result => {
        expect(result).toBe(request);
        done();
      });
    });
  });
});
