import { APMPaymentMethod } from './APMPaymentMethod';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { FrameQueryingServiceMock } from '../../../shared/services/message-bus/FrameQueryingServiceMock';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { Observable, of } from 'rxjs';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { NoThreeDSRequestProcessingService } from '../../../application/core/services/request-processor/processing-services/NoThreeDSRequestProcessingService';

describe('APMPaymentMethod', () => {
  let noThreeDSRequestProcessingServiceMock: NoThreeDSRequestProcessingService;
  let frameQueryingServiceMock: FrameQueryingServiceMock;
  let requestProcessingServiceMock: IRequestProcessingService;
  let sut: APMPaymentMethod;
  const APMConfigMock: IAPMConfig = {
    apmList: [APMName.ZIP],
    placement: 'st-apm',
    errorRedirectUrl: 'errorRedirectUrl',
    cancelRedirectUrl: 'cancelRedirectUrl',
    successRedirectUrl: 'successRedirectUrl',
  };
  let messageBusMock: IMessageBus;

  beforeEach(() => {
    noThreeDSRequestProcessingServiceMock = mock(NoThreeDSRequestProcessingService);
    frameQueryingServiceMock = new FrameQueryingServiceMock();
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    messageBusMock = new SimpleMessageBus();
    sut = new APMPaymentMethod(
      frameQueryingServiceMock,
      instance(noThreeDSRequestProcessingServiceMock),
      messageBusMock,
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
});
