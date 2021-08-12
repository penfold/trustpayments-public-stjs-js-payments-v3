import { mock, instance, when, verify, anything, deepEqual, spy } from 'ts-mockito';
import { IGatewayClient } from '../../gateway-client/IGatewayClient';
import { ThreeDSecureMethodService } from '../../three-d-verification/implementations/trust-payments/ThreeDSecureMethodService';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ThreeDLookupRequestProcessor } from './ThreeDLookupRequestProcessor';
import { IThreeDLookupResponse } from '../../../models/IThreeDLookupResponse';
import { CardType } from '@trustpayments/3ds-sdk-js';
import { of } from 'rxjs';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { IStRequest } from '../../../models/IStRequest';
import { ThreeDLookupRequest } from '../../three-d-verification/implementations/trust-payments/data/ThreeDLookupRequest';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';

describe('ThreeDLookupRequestProcessor', () => {
  let gatewayClientMock: IGatewayClient;
  let threeDSecureMethodServiceMock: ThreeDSecureMethodService;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let threeDLookupRequestProcessor: ThreeDLookupRequestProcessor;

  beforeEach(() => {
    gatewayClientMock = mock<IGatewayClient>();
    threeDSecureMethodServiceMock = mock(ThreeDSecureMethodService);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    threeDLookupRequestProcessor = new ThreeDLookupRequestProcessor(
      instance(gatewayClientMock),
      instance(threeDSecureMethodServiceMock),
      instance(interFrameCommunicatorMock),
    );
  });

  describe('process()', () => {
    const request: IStRequest = { pan: '1111111111111111' };
    const options: IRequestProcessingOptions = {
      jsInitResponse: undefined,
      timer: of(0),
    };
    const threeDLookupResponse: IThreeDLookupResponse = {
      customeroutput: undefined,
      errorcode: '',
      errormessage: '',
      jwt: '',
      paymenttypedescription: CardType.MASTER_CARD,
      requesttypedescription: '',
      threedmethodurl: 'https://methodurl',
      threednotificationurl: 'https://notificationurl',
      threedstransactionid: '12345',
      threedversion: '',
      transactionstartedtimestamp: '',
    };

    beforeEach(() => {
      when(gatewayClientMock.threedLookup(anything())).thenReturn(of(threeDLookupResponse));
      when(interFrameCommunicatorMock.query(anything(), anything())).thenResolve(undefined);
      when(threeDSecureMethodServiceMock.perform3DSMethod$(anything(), anything(), anything())).thenReturn(of({
        description: '',
        status: undefined,
        transactionId: '',
      }));
    });

    it('send the THREEDLOOKUP request', done => {
      threeDLookupRequestProcessor.process(request, options).subscribe(() => {
        verify(gatewayClientMock.threedLookup(deepEqual(new ThreeDLookupRequest(request)))).once();
        done();
      });
    });

    it('subscribes to timer from options if provided', done => {
      const timerSpy = spy(options.timer);

      threeDLookupRequestProcessor.process(request, options).subscribe(() => {
        verify(timerSpy.subscribe()).once();
        done();
      });
    });

    it('sends the THREE_D_SECURE_PROCESSING_SCREEN_SHOW event', done => {
      threeDLookupRequestProcessor.process(request, options).subscribe(() => {
        verify(interFrameCommunicatorMock.query(deepEqual({
          type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW,
          data: CardType.MASTER_CARD,
        }), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });

    it('runs the 3DS method with THREEDLOOKUP response data', done => {
      threeDLookupRequestProcessor.process(request, options).subscribe(() => {
        verify(interFrameCommunicatorMock.query(deepEqual({
          type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW,
          data: CardType.MASTER_CARD,
        }), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });

    it('returns unmodified request data', done => {
      threeDLookupRequestProcessor.process(request, options).subscribe(result => {
        expect(result).toBe(request);
        done();
      });
    });
  });
});
