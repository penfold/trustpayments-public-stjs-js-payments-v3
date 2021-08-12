import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { CybertonicaRequestProcessor } from '../request-processors/CybertonicaRequestProcessor';
import { of } from 'rxjs';
import { TPThreeDSRequestProcessingService } from './TPThreeDSRequestProcessingService';
import { ConfigProvider } from '../../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ThreeDLookupRequestProcessor } from '../request-processors/ThreeDLookupRequestProcessor';
import { BrowserDataRequestProcessor } from '../request-processors/BrowserDataRequestProcessor';
import { HideProcessingScreenResponseProcessor } from '../response-processors/HideProcessingScreenResponseProcessor';
import { TPChallengeResponseProcessor } from '../response-processors/TPChallengeResponseProcessor';
import { RemainingRequestTypesResponseProcessor } from '../response-processors/RemainingRequestTypesResponseProcessor';
import { HideProcessingScreenErrorHandler } from '../error-handlers/HideProcessingScreenErrorHandler';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { ConfigInterface, LoggingLevel } from '@trustpayments/3ds-sdk-js';
import { threeDSecureConfigName } from '../../three-d-verification/implementations/trust-payments/IThreeDSecure';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';

describe('TPThreeDSRequestProcessingService', () => {
  let requestProcessingChainFactoryMock: RequestProcessingChainFactory;
  let configProviderMock: ConfigProvider;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let tpThreeDSRequestProcessingService: TPThreeDSRequestProcessingService;
  let requestProcessingChainMock: RequestProcessingChain;

  const jsInitResponse: IThreeDInitResponse = {
    jwt: '',
    threedsprovider: undefined,
  };
  const threedsConfig: ConfigInterface = { loggingLevel: LoggingLevel.ALL };

  beforeEach(() => {
    requestProcessingChainFactoryMock = mock(RequestProcessingChainFactory);
    configProviderMock = mock<ConfigProvider>();
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    requestProcessingChainMock = mock(RequestProcessingChain);
    tpThreeDSRequestProcessingService = new TPThreeDSRequestProcessingService(
      instance(requestProcessingChainFactoryMock),
      instance(configProviderMock),
      instance(interFrameCommunicatorMock),
    );

    when(interFrameCommunicatorMock.query(anything(), anything())).thenResolve(undefined);
    when(requestProcessingChainFactoryMock.create(anything(), anything(), anything())).thenReturn(instance(requestProcessingChainMock));
    when(configProviderMock.getConfig$()).thenReturn(of({
      [threeDSecureConfigName]: threedsConfig,
    }));
  });

  describe('init()', () => {
    it('should create a request processing chain with proper processors', done => {
      tpThreeDSRequestProcessingService.init(jsInitResponse).subscribe(() => {
        verify(requestProcessingChainFactoryMock.create(
          deepEqual([
            CybertonicaRequestProcessor,
            ThreeDLookupRequestProcessor,
            BrowserDataRequestProcessor,
          ]),
          deepEqual([
            HideProcessingScreenResponseProcessor,
            TPChallengeResponseProcessor,
            RemainingRequestTypesResponseProcessor,
          ]),
          HideProcessingScreenErrorHandler,
        )).once();
        done();
      });
    });

    it('should initialize TP 3DS library', done => {
      tpThreeDSRequestProcessingService.init(jsInitResponse).subscribe(() => {
        verify(interFrameCommunicatorMock.query(deepEqual({
          type: PUBLIC_EVENTS.THREE_D_SECURE_INIT,
          data: threedsConfig,
        }), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('process()', () => {
    const request: IStRequest = {};
    const response: IRequestTypeResponse = {};

    beforeEach(() => {
      tpThreeDSRequestProcessingService.init(jsInitResponse);
      when(requestProcessingChainMock.process(anything(), anything())).thenReturn(of(response));
    });

    it('runs the processing chain with given request data', done => {
      tpThreeDSRequestProcessingService.process(request).subscribe(result => {
        verify(requestProcessingChainMock.process(request, deepEqual({
          jsInitResponse,
          merchantUrl: undefined,
          timer: anything(),
        }))).once();
        expect(result).toBe(response);
        done();
      });
    });

    it('runs the processing chain with given request data and merchant url', done => {
      const merchantUrl = 'https://merchanturl';
      tpThreeDSRequestProcessingService.process(request, merchantUrl).subscribe(result => {
        verify(requestProcessingChainMock.process(request, deepEqual({
          jsInitResponse,
          merchantUrl,
          timer: anything(),
        }))).once();
        expect(result).toBe(response);
        done();
      });
    });
  });
});
