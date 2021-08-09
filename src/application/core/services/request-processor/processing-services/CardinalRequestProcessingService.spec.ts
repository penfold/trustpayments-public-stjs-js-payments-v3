import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { CacheTokenRequestProcessor } from '../request-processors/CacheTokenRequestProcessor';
import { CybertonicaRequestProcessor } from '../request-processors/CybertonicaRequestProcessor';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { of } from 'rxjs';
import { CardinalRequestProcessingService } from './CardinalRequestProcessingService';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { SimpleMessageBus } from '../../../shared/message-bus/SimpleMessageBus';
import { CardinalStartRequestProcessor } from '../request-processors/CardinalStartRequestProcessor';
import { CardinalChallengeResponseProcessor } from '../response-processors/CardinalChallengeResponseProcessor';
import { RemainingRequestTypesResponseProcessor } from '../response-processors/RemainingRequestTypesResponseProcessor';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { PaymentEvents } from '../../../models/constants/PaymentEvents';

describe('CardinalRequestProcessingService', () => {
  let requestProcessingChainFactoryMock: RequestProcessingChainFactory;
  let cardinalRequestProcessingService: CardinalRequestProcessingService;
  let requestProcessingChainMock: RequestProcessingChain;
  let messageBus: IMessageBus;
  let interFrameCommunicatorMock: InterFrameCommunicator;

  const jsInitResponse: IThreeDInitResponse = {
    jwt: '',
    threedsprovider: undefined,
    threedinit: 'cardinaljwt',
  };

  beforeEach(() => {
    requestProcessingChainFactoryMock = mock(RequestProcessingChainFactory);
    requestProcessingChainMock = mock(RequestProcessingChain);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    messageBus = new SimpleMessageBus();
    cardinalRequestProcessingService = new CardinalRequestProcessingService(
      instance(interFrameCommunicatorMock),
      messageBus,
      instance(requestProcessingChainFactoryMock),
    );

    when(requestProcessingChainFactoryMock.create(anything(), anything())).thenReturn(instance(requestProcessingChainMock));
    when(interFrameCommunicatorMock.query(anything(), anything())).thenResolve(undefined);
  });

  describe('init()', () => {
    it('should create a request processing chain with proper processors', done => {
      cardinalRequestProcessingService.init(jsInitResponse).subscribe(() => {
        verify(requestProcessingChainFactoryMock.create(
          deepEqual([
            CacheTokenRequestProcessor,
            CybertonicaRequestProcessor,
            CardinalStartRequestProcessor,
          ]),
          deepEqual([
            CardinalChallengeResponseProcessor,
            RemainingRequestTypesResponseProcessor,
          ]),
        )).once();
        done();
      });
    });

    it('sends CARDINAL_SETUP event to parent frame', done => {
      cardinalRequestProcessingService.init(jsInitResponse).subscribe(() => {
        verify(interFrameCommunicatorMock.query(deepEqual({
          type: PUBLIC_EVENTS.CARDINAL_SETUP,
          data: {
            jwt: 'cardinaljwt',
          },
        }), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });

    it('sends CARINDAL_TRIGGER event on BIN_PROCESS event', done => {
      const pan = '1111111111111111';

      cardinalRequestProcessingService.init(jsInitResponse).subscribe(() => {
        messageBus.publish({
          type: PUBLIC_EVENTS.BIN_PROCESS,
          data: pan,
        });

        verify(interFrameCommunicatorMock.send(deepEqual({
          type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
          data: {
            eventName: PaymentEvents.BIN_PROCESS,
            data: pan,
          },
        }), MERCHANT_PARENT_FRAME)).once();

        done();
      });
    });
  });

  describe('process()', () => {
    const request: IStRequest = {};
    const response: IRequestTypeResponse = {};

    beforeEach(() => {
      cardinalRequestProcessingService.init(jsInitResponse);
      when(requestProcessingChainMock.process(anything(), anything())).thenReturn(of(response));
    });

    it('runs the processing chain with given request data', done => {
      cardinalRequestProcessingService.process(request).subscribe(result => {
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
      cardinalRequestProcessingService.process(request, merchantUrl).subscribe(result => {
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
