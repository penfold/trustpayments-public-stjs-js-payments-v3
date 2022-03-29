import { Observable, of } from 'rxjs';
import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { FrameQueryingServiceMock } from '../../../shared/services/message-bus/FrameQueryingServiceMock';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { APMRequestPayloadFactory } from '../services/apm-request-payload-factory/APMRequestPayloadFactory';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { EventScope } from '../../../application/core/models/constants/EventScope';
import { APMRequestProcessingService } from '../../../application/core/services/request-processor/processing-services/APMRequestProcessingService';
import { APMPaymentMethod } from './APMPaymentMethod';

describe('APMPaymentMethod', () => {
  let apmRequestProcessingServiceMock: APMRequestProcessingService;
  let frameQueryingServiceMock: FrameQueryingServiceMock;
  let requestPayloadFactoryMock: APMRequestPayloadFactory;
  let sut: APMPaymentMethod;

  const APMConfigMock: IAPMConfig = {
    apmList: [APMName.ZIP],
    placement: 'st-apm',
  };

  const APMItemConfigMock: IAPMItemConfig = {
    name: APMName.ZIP,
  };

  let messageBusMock: IMessageBus;

  beforeEach(() => {
    apmRequestProcessingServiceMock = mock(APMRequestProcessingService);
    frameQueryingServiceMock = new FrameQueryingServiceMock();
    messageBusMock = mock<IMessageBus>();
    requestPayloadFactoryMock = mock(APMRequestPayloadFactory);
    sut = new APMPaymentMethod(
      frameQueryingServiceMock,
      instance(apmRequestProcessingServiceMock),
      instance(messageBusMock),
      instance(requestPayloadFactoryMock)
    );

    when(apmRequestProcessingServiceMock.init(null)).thenReturn(new Observable<void>(subscriber => {
      subscriber.next();
      subscriber.complete();
    }));

    frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.APM_INIT_CLIENT, () => of(undefined));
  });

  describe('getName()', () => {
    it('returns main name of APM service', () => {
      expect(sut.getName()).toBe(APMPaymentMethodName);
    });
  });

  describe('init()', () => {
    it('should send an event to initialize payment by the client side', (done) => {
      const frameQueryingServiceSpy = spy(frameQueryingServiceMock);

      sut.init(APMConfigMock).subscribe(() => {
        verify(apmRequestProcessingServiceMock.init(null)).once();
        verify(frameQueryingServiceSpy.query(
          deepEqual({ type: PUBLIC_EVENTS.APM_INIT_CLIENT, data: APMConfigMock }),
          MERCHANT_PARENT_FRAME
        )).once();
        done();
      });
    });
  });

  describe('start()', () => {
    beforeEach(() => {
      sut.init(APMConfigMock).subscribe();
    });

    it('performs request processing with noThreeDSRequestProcessingService, returns the gateway response with errorcode !==0', done => {
      const request = {
        paymenttypedescription: APMItemConfigMock.name,
      };

      when(requestPayloadFactoryMock.create(anything())).thenReturn(request);

      when(apmRequestProcessingServiceMock.process(anything())).thenReturn(of({
        errorcode: '1234',
        errormessage: 'error message',
      }));

      sut.start(APMItemConfigMock).subscribe(response => {
        expect(response).toEqual({
          data: { errorcode: '1234', errormessage: 'error message' },
          error: { code: 1234, message: 'error message' },
          paymentMethodName: 'APM',
          status: 'failure',
        });

        verify(apmRequestProcessingServiceMock.process(request)).once();

        done();
      });
    });

    it('should publish APM_REDIRECT event to message bus with an redirect url', () => {
      when(apmRequestProcessingServiceMock.process(anything())).thenReturn(of({
        errorcode: '0',
        errormessage: 'success message',
        redirecturl: 'redirecturl',
      }));

      sut.start(APMItemConfigMock).subscribe();
      verify(messageBusMock.publish(deepEqual({
        type: PUBLIC_EVENTS.APM_REDIRECT,
        data: 'redirecturl',
      }), EventScope.ALL_FRAMES)).once();
    });
  });
});
