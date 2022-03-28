import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { JsInitResponseService } from '../three-d-verification/JsInitResponseService';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { ThreeDVerificationProviderName } from '../three-d-verification/data/ThreeDVerificationProviderName';
import { RemainingRequestTypesProvider } from '../three-d-verification/RemainingRequestTypesProvider';
import { RequestType } from '../../../../shared/types/RequestType';
import { IRequestProcessingService } from './IRequestProcessingService';
import { RequestProcessingInitializer } from './RequestProcessingInitializer';
import { RequestProcessingServiceProvider } from './RequestProcessingServiceProvider';

describe('RequestProcessingInitializer', () => {
  let jsInitResponseServiceMock: JsInitResponseService;
  let requestProcessingServiceProviderMock: RequestProcessingServiceProvider;
  let requestProcessingServiceMock: IRequestProcessingService;
  let requestProcessingService: IRequestProcessingService;
  let remainingRequestTypesProviderMock: RemainingRequestTypesProvider;
  let requestProcessingInitializer: RequestProcessingInitializer;

  const jsInitResponse: IThreeDInitResponse = {
    jwt: '',
    threedsprovider: ThreeDVerificationProviderName.CARDINAL,
  };

  beforeEach(() => {
    jsInitResponseServiceMock = mock(JsInitResponseService);
    requestProcessingServiceProviderMock = mock(RequestProcessingServiceProvider);
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    remainingRequestTypesProviderMock = mock(RemainingRequestTypesProvider);
    requestProcessingService = instance(requestProcessingServiceMock);

    requestProcessingInitializer = new RequestProcessingInitializer(
      instance(jsInitResponseServiceMock),
      instance(requestProcessingServiceProviderMock),
      instance(remainingRequestTypesProviderMock)
    );

    when(jsInitResponseServiceMock.getJsInitResponse(undefined)).thenReturn(of(jsInitResponse));
    when(jsInitResponseServiceMock.getJsInitResponse(anything())).thenReturn(of(jsInitResponse));
    when(requestProcessingServiceProviderMock.getRequestProcessingService(anything(), anything())).thenReturn(requestProcessingService);
    when(requestProcessingServiceProviderMock.getRequestProcessingServiceWithout3D()).thenReturn(requestProcessingService);
    when(requestProcessingServiceMock.init(anything())).thenReturn(of(undefined));
    when(remainingRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(of([RequestType.THREEDQUERY, RequestType.AUTH]));
  });

  describe('initialize()', () => {
    it('initializes selected processing service based on JSINIT response', done => {
      requestProcessingInitializer.initialize().subscribe(result => {
        expect(result).toBe(requestProcessingService);
        verify(jsInitResponseServiceMock.getJsInitResponse(undefined)).once();
        verify(requestProcessingServiceProviderMock.getRequestProcessingService(
          deepEqual([RequestType.THREEDQUERY, RequestType.AUTH]),
          jsInitResponse)
        ).once();
        verify(requestProcessingServiceMock.init(jsInitResponse)).once();
        done();
      });
    });

    it('initializes selected processing service based on JSINIT response with gatewayClient', done => {
      requestProcessingInitializer.initialize().subscribe(result => {
        expect(result).toBe(requestProcessingService);
        verify(jsInitResponseServiceMock.getJsInitResponse(anything())).once();
        verify(requestProcessingServiceProviderMock.getRequestProcessingService(
          deepEqual([RequestType.THREEDQUERY, RequestType.AUTH]),
          jsInitResponse)
        ).once();
        verify(requestProcessingServiceMock.init(jsInitResponse)).once();
        done();
      });
    });

    it('initializes no-3D processing service when THREEDQUERY is not specified in request types', done => {
      when(remainingRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(of([RequestType.AUTH]));

      requestProcessingInitializer.initialize().subscribe(result => {
        expect(result).toBe(requestProcessingService);
        verify(jsInitResponseServiceMock.getJsInitResponse()).never();
        verify(requestProcessingServiceProviderMock.getRequestProcessingServiceWithout3D()).once();
        verify(requestProcessingServiceMock.init(null)).once();
        done();
      });
    });
  });
});
