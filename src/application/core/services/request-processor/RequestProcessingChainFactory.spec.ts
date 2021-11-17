import { mock, instance, when } from 'ts-mockito';
import { ContainerInstance } from 'typedi';
import { Observable } from 'rxjs';
import { TransportService } from '../st-transport/TransportService';
import { IStRequest } from '../../models/IStRequest';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { RequestProcessingChainFactory } from './RequestProcessingChainFactory';
import { IRequestProcessor } from './IRequestProcessor';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';
import { IResponseProcessor } from './IResponseProcessor';
import { IErrorHandler } from './IErrorHandler';
import { RequestProcessingChain } from './RequestProcessingChain';

class FooRequestProcessor implements IRequestProcessor {
  process(requestData: IStRequest, options: IRequestProcessingOptions): Observable<IStRequest> {
    return undefined;
  }
}

class BarResponseProcessor implements IResponseProcessor {
  process(response: IRequestTypeResponse, requestData: IStRequest, options: IRequestProcessingOptions): Observable<IRequestTypeResponse> {
    return undefined;
  }
}

class BazErrorHandler implements IErrorHandler {
  handle(error: unknown, requestData: IStRequest, options: IRequestProcessingOptions): Observable<IRequestTypeResponse> | Observable<never> {
    return undefined;
  }
}

describe('RequestProcessingChainFactory', () => {
  const fooRequestProcessor = new FooRequestProcessor();
  const barResponseProcessor = new BarResponseProcessor();
  const bazErrorHandler = new BazErrorHandler();

  let transportService: TransportService;
  let containerMock: ContainerInstance;
  let requestProcessingChainFactory: RequestProcessingChainFactory;

  beforeEach(() => {
    transportService = instance(mock(TransportService));
    containerMock = mock(ContainerInstance);
    requestProcessingChainFactory = new RequestProcessingChainFactory(
      transportService,
      instance(containerMock),
    );

    when(containerMock.get(FooRequestProcessor)).thenReturn(fooRequestProcessor);
    when(containerMock.get(BarResponseProcessor)).thenReturn(barResponseProcessor);
    when(containerMock.get(BazErrorHandler)).thenReturn(bazErrorHandler);
  });

  describe('create()', () => {
    it('should create a processing chain with empty processors lists', () => {
      const result = requestProcessingChainFactory.create([], []);

      expect(result).toEqual(new RequestProcessingChain([], [], transportService));
    });

    it('should create a processing chain', () => {
      const result = requestProcessingChainFactory.create(
        [FooRequestProcessor],
        [BarResponseProcessor],
      );

      expect(result).toEqual(new RequestProcessingChain(
        [fooRequestProcessor],
        [barResponseProcessor],
        transportService,
      ));
    });

    it('should create a processing chain with error handler', () => {
      const result = requestProcessingChainFactory.create(
        [FooRequestProcessor],
        [BarResponseProcessor],
        BazErrorHandler,
      );

      expect(result).toEqual(new RequestProcessingChain(
        [fooRequestProcessor],
        [barResponseProcessor],
        transportService,
        bazErrorHandler,
      ));
    });
  });
});
