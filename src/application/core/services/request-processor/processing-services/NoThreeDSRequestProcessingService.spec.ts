import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito';
import { of } from 'rxjs';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { CacheTokenRequestProcessor } from '../request-processors/CacheTokenRequestProcessor';
import { FraudControlRequestProcessor } from '../request-processors/FraudControlRequestProcessor';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../../models/IStRequest';
import { NoThreeDSRequestProcessingService } from './NoThreeDSRequestProcessingService';

describe('NoThreeDSRequestProcessingService', () => {
  let requestProcessingChainFactoryMock: RequestProcessingChainFactory;
  let noThreeDSRequestProcessingService: NoThreeDSRequestProcessingService;
  let requestProcessingChainMock: RequestProcessingChain;

  const jsInitResponse: IThreeDInitResponse = {
    jwt: '',
    threedsprovider: undefined,
  };

  beforeEach(() => {
    requestProcessingChainFactoryMock = mock(RequestProcessingChainFactory);
    requestProcessingChainMock = mock(RequestProcessingChain);
    noThreeDSRequestProcessingService = new NoThreeDSRequestProcessingService(
      instance(requestProcessingChainFactoryMock),
    );

    when(requestProcessingChainFactoryMock.create(anything(), anything())).thenReturn(instance(requestProcessingChainMock));
  });

  describe('init()', () => {
    it('should create a request processing chain with proper processors', done => {
      noThreeDSRequestProcessingService.init(jsInitResponse).subscribe(() => {
        verify(requestProcessingChainFactoryMock.create(
          deepEqual([
            CacheTokenRequestProcessor,
            FraudControlRequestProcessor,
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
      noThreeDSRequestProcessingService.init(jsInitResponse);
      when(requestProcessingChainMock.process(anything(), anything())).thenReturn(of(response));
    });

    it('runs the processing chain with given request data', done => {
      noThreeDSRequestProcessingService.process(request).subscribe(result => {
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
      noThreeDSRequestProcessingService.process(request, merchantUrl).subscribe(result => {
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
