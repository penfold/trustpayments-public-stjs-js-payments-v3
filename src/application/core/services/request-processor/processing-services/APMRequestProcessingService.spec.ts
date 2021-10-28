import { of } from 'rxjs';
import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { CacheTokenRequestProcessor } from '../request-processors/CacheTokenRequestProcessor';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../../models/IStRequest';
import { APMRequestProcessingService } from './APMRequestProcessingService';

describe('APMRequestProcessingService', () => {
  let requestProcessingChainFactoryMock: RequestProcessingChainFactory;
  let ampRequestProcessingService: APMRequestProcessingService;
  let requestProcessingChainMock: RequestProcessingChain;

  const jsInitResponse: IThreeDInitResponse = {
    jwt: '',
    threedsprovider: undefined,
  };

  beforeEach(() => {
    requestProcessingChainFactoryMock = mock(RequestProcessingChainFactory);
    requestProcessingChainMock = mock(RequestProcessingChain);
    ampRequestProcessingService = new APMRequestProcessingService(
      instance(requestProcessingChainFactoryMock),
    );

    when(requestProcessingChainFactoryMock.create(anything(), anything())).thenReturn(instance(requestProcessingChainMock));
  });

  describe('init()', () => {
    it('should create a request processing chain with proper processors', done => {
      ampRequestProcessingService.init(jsInitResponse).subscribe(() => {
        verify(requestProcessingChainFactoryMock.create(
          deepEqual([
            CacheTokenRequestProcessor,
          ]),
          deepEqual([]),
        )).once();
        done();
      });
    });
  });

  describe('process()', () => {
    const request: IStRequest = {};
    const response: IRequestTypeResponse = {};

    beforeEach(() => {
      ampRequestProcessingService.init(jsInitResponse);
      when(requestProcessingChainMock.process(anything(), anything())).thenReturn(of(response));
    });

    it('runs the processing chain with given request data', done => {
      ampRequestProcessingService.process(request).subscribe(result => {
        verify(requestProcessingChainMock.process(request, deepEqual({
          jsInitResponse,
          merchantUrl: undefined,
        }))).once();
        expect(result).toBe(response);
        done();
      });
    });

    it('runs the processing chain with given request data and merchant url', done => {
      const merchantUrl = 'https://merchanturl';
      ampRequestProcessingService.process(request, merchantUrl).subscribe(result => {
        verify(requestProcessingChainMock.process(request, deepEqual({
          jsInitResponse,
          merchantUrl,
        }))).once();
        expect(result).toBe(response);
        done();
      });
    });
  });
});
