import { mock, instance, when } from 'ts-mockito';
import { Cybertonica } from '../../../integrations/cybertonica/Cybertonica';
import { IStRequest } from '../../../models/IStRequest';
import { CybertonicaRequestProcessor } from './CybertonicaRequestProcessor';

describe('CybertonicaRequestProcessor', () => {
  let cybertonicaMock: Cybertonica;
  let cybertonicaRequestProcessor: CybertonicaRequestProcessor;

  beforeEach(() => {
    cybertonicaMock = mock(Cybertonica);
    cybertonicaRequestProcessor = new CybertonicaRequestProcessor(
      instance(cybertonicaMock),
    );
  });

  describe('process()', () => {
    const request: IStRequest = { pan: '1111111111111111' };

    it('should add fraudcontroltransactionid field with cybertonica tid', done => {
      when(cybertonicaMock.getTransactionId()).thenResolve('foobar1234');

      cybertonicaRequestProcessor.process(request).subscribe(result => {
        expect(result).toEqual({ ...request, fraudcontroltransactionid: 'foobar1234' });
        done();
      });
    });

    it('should not add fraudcontroltransactionid field when cybertonica tid is empty', done => {
      when(cybertonicaMock.getTransactionId()).thenResolve(null);

      cybertonicaRequestProcessor.process(request).subscribe(result => {
        expect(result).toBe(request);
        done();
      });
    });
  });
});
