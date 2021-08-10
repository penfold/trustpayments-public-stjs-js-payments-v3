import { anything, instance, mock, verify, when } from 'ts-mockito';
import { IRequestProcessor } from './IRequestProcessor';
import { IResponseProcessor } from './IResponseProcessor';
import { RequestProcessingChain } from './RequestProcessingChain';
import { TransportService } from '../st-transport/TransportService';
import { IErrorHandler } from './IErrorHandler';
import { IStRequest } from '../../models/IStRequest';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { of, throwError } from 'rxjs';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';
import { ThreeDVerificationProviderName } from '../three-d-verification/data/ThreeDVerificationProviderName';
import { IJwtResponse } from '../st-codec/interfaces/IJwtResponse';

describe('RequestProcessingChain', () => {
  let requestProcessorMocks: IRequestProcessor[];
  let responseProcessorMocks: IResponseProcessor[];
  let transportServiceMock: TransportService;
  let errorHandlerMock: IErrorHandler;
  let requestProcessingChain: RequestProcessingChain;
  const requests: IStRequest[] = [0,1,2,3].map(i => ({ pan: '1234123412341234', expirydate: '12/23', securitycode: `${i}` }));
  const responses: IRequestTypeResponse[] = [0,1,2,3].map(i => ({ errorcode: '0', i }));

  beforeEach(() => {
    requestProcessorMocks = [1,2,3].map(() => mock<IRequestProcessor>());
    responseProcessorMocks = [1,2,3].map(() => mock<IResponseProcessor>());
    transportServiceMock = mock(TransportService);
    errorHandlerMock = mock<IErrorHandler>();
    requestProcessingChain = new RequestProcessingChain(
      requestProcessorMocks.map(mock => instance(mock)),
      responseProcessorMocks.map(mock => instance(mock)),
      instance(transportServiceMock),
    );

    requestProcessorMocks.forEach((processor, index) => {
      when(processor.process(anything(), anything())).thenReturn(of(requests[index + 1]));
    });

    responseProcessorMocks.forEach((processor, index) => {
      when(processor.process(anything(), anything(), anything())).thenReturn(of(responses[index + 1]));
    });

    when(transportServiceMock.sendRequest(anything(), anything())).thenReturn(of(responses[0] as IRequestTypeResponse & IJwtResponse));
  });

  describe('process()', () => {
    const options: IRequestProcessingOptions = {
      jsInitResponse: {
        jwt: '',
        threedsprovider: ThreeDVerificationProviderName.CARDINAL,
      },
      merchantUrl: 'https://merchant.url',
    };

    it('returns the value from the last response processor', done => {
      requestProcessingChain.process(requests[0], options).subscribe(result => {
        expect(result).toBe(responses[3]);
        done();
      });
    });

    it('runs the request through every request processor', done => {
      requestProcessingChain.process(requests[0], options).subscribe(() => {
        requestProcessorMocks.forEach((processor, index) => {
          verify(processor.process(requests[index], options)).once();
        });
        done();
      });
    });

    it('calls the transport service with request data from last request processor', done => {
      requestProcessingChain.process(requests[0], options).subscribe(() => {
        verify(transportServiceMock.sendRequest(requests[3], 'https://merchant.url')).once();
        done();
      });
    });

    it('runs the response through every response processor', done => {
      requestProcessingChain.process(requests[0], options).subscribe(() => {
        responseProcessorMocks.forEach((processor, index) => {
          verify(processor.process(responses[index], requests[3], options)).once();
        });
        done();
      });
    });

    it('passes any errors to error handler if one is specified', done => {
      requestProcessingChain = new RequestProcessingChain(
        [],
        [],
        instance(transportServiceMock),
        instance(errorHandlerMock),
      );

      const error = new Error();

      when(transportServiceMock.sendRequest(anything(), anything())).thenReturn(throwError(error));
      when(errorHandlerMock.handle(anything(), anything(), anything())).thenReturn(of(responses[0]));

      requestProcessingChain.process(requests[0], options).subscribe(result => {
        verify(errorHandlerMock.handle(error, requests[0], options)).once();
        expect(result).toBe(responses[0]);
        done();
      });
    });
  });
});
