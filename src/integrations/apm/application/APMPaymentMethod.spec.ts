import { APMPaymentMethod } from './APMPaymentMethod';
import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { FrameQueryingServiceMock } from '../../../shared/services/message-bus/FrameQueryingServiceMock';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { Observable, of } from 'rxjs';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { NoThreeDSRequestProcessingService } from '../../../application/core/services/request-processor/processing-services/NoThreeDSRequestProcessingService';
import { APMRequestPayloadFactory } from '../services/apm-request-payload-factory/APMRequestPayloadFactory';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { EventScope } from '../../../application/core/models/constants/EventScope';

describe('APMPaymentMethod', () => {
  let noThreeDSRequestProcessingServiceMock: NoThreeDSRequestProcessingService;
  let frameQueryingServiceMock: FrameQueryingServiceMock;
  let requestPayloadFactoryMock: APMRequestPayloadFactory;
  let requestProcessingServiceMock: IRequestProcessingService;
  let sut: APMPaymentMethod;

  const APMConfigMock: IAPMConfig = {
    apmList: [APMName.ZIP],
    placement: 'st-apm',
    errorRedirectUrl: 'errorRedirectUrl',
    cancelRedirectUrl: 'cancelRedirectUrl',
    successRedirectUrl: 'successRedirectUrl',
  };

  const APMItemConfigMock: IAPMItemConfig = {
    name: APMName.ZIP,
    successRedirectUrl: 'successRedirectUrlAdditional',
    errorRedirectUrl: 'errorRedirectUrlAdditional',
  };

  let messageBusMock: IMessageBus;

  beforeEach(() => {
    noThreeDSRequestProcessingServiceMock = mock(NoThreeDSRequestProcessingService);
    frameQueryingServiceMock = new FrameQueryingServiceMock();
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    messageBusMock = mock<IMessageBus>();
    requestPayloadFactoryMock = mock(APMRequestPayloadFactory);
    sut = new APMPaymentMethod(
      frameQueryingServiceMock,
      instance(noThreeDSRequestProcessingServiceMock),
      instance(messageBusMock),
      instance(requestPayloadFactoryMock),
    );

    when(noThreeDSRequestProcessingServiceMock.init(null)).thenReturn(new Observable<void>(subscriber => {
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
        verify(noThreeDSRequestProcessingServiceMock.init(null)).once();
        verify(frameQueryingServiceSpy.query(
          deepEqual({ type: PUBLIC_EVENTS.APM_INIT_CLIENT, data: APMConfigMock }),
          MERCHANT_PARENT_FRAME,
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
        successfulurlredirect: APMItemConfigMock.successRedirectUrl,
        errorurlredirect: APMItemConfigMock.errorRedirectUrl,
      };

      when(requestPayloadFactoryMock.create(anything())).thenReturn(request);

      when(noThreeDSRequestProcessingServiceMock.process(anything())).thenReturn(of({
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

        verify(noThreeDSRequestProcessingServiceMock.process(request)).once();

        done();
      });
    });

    it('should publish APM_REDIRECT event to message bus with an redirect url', () => {
      when(noThreeDSRequestProcessingServiceMock.process(anything())).thenReturn(of({
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
