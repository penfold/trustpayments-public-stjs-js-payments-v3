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

describe('APMPaymentMethod', () => {
  let requestProcessingInitializerMock: RequestProcessingInitializer;
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

  beforeEach(() => {
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    frameQueryingServiceMock = new FrameQueryingServiceMock();
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    sut = new APMPaymentMethod(
      frameQueryingServiceMock,
      instance(requestProcessingInitializerMock),
    );

    when(requestProcessingInitializerMock.initialize()).thenReturn(new Observable<IRequestProcessingService>(subscriber => {
      subscriber.next(instance(requestProcessingServiceMock));
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
        verify(requestProcessingInitializerMock.initialize()).once();
        verify(frameQueryingServiceSpy.query(
          deepEqual({ type: PUBLIC_EVENTS.APM_INIT_CLIENT, data: APMConfigMock }),
          MERCHANT_PARENT_FRAME,
        )).once();
        done();
      });
    });
  });
});
