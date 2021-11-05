import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { RequestType } from '../../../../../shared/types/RequestType';
import { RemainingRequestTypesProvider } from '../../three-d-verification/RemainingRequestTypesProvider';
import { IStRequest } from '../../../models/IStRequest';
import { APMName } from '../../../../../integrations/apm/models/APMName';
import { TermUrlRequestProcessor } from './TermUrlRequestProcessor';

describe('TermUrlRequestProcessor', () => {
  const request: IStRequest = { paymenttypedescription: APMName.ZIP } as IStRequest;

  let remainingRequestTypesProviderMock: RemainingRequestTypesProvider;
  let termUrlRequestProcessor: TermUrlRequestProcessor;

  beforeEach(() => {
    remainingRequestTypesProviderMock = mock(RemainingRequestTypesProvider);
    termUrlRequestProcessor = new TermUrlRequestProcessor(
      instance(remainingRequestTypesProviderMock),
    );
  });

  describe('process()', () => {
    it('adds termurl property if THREEDQUERY exists in request types', done => {
      when(remainingRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(of([RequestType.THREEDQUERY, RequestType.AUTH]));

      termUrlRequestProcessor.process(request, null).subscribe(result => {
        expect(result.termurl).toBe('https://termurl');
        done();
      });
    });

    it('doesnt add termurl property if THREEDQUERY doesnt exist in request types', done => {
      when(remainingRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(of([RequestType.AUTH]));

      termUrlRequestProcessor.process(request, null).subscribe(result => {
        expect(result.termurl).toBeUndefined();
        done();
      });
    });

    it('doesnt change the existing termurl property', done => {
      when(remainingRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(of([RequestType.THREEDQUERY, RequestType.AUTH]));

      const requestWithTermUrl = { ...request, termurl: 'https://existingtermurl' } as IStRequest;

      termUrlRequestProcessor.process(requestWithTermUrl, null).subscribe(result => {
        expect(result.termurl).toBe('https://existingtermurl');
        done();
      });
    });
  });
});
