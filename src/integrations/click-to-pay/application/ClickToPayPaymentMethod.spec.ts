import { instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { ClickToPayPaymentMethod } from './ClickToPayPaymentMethod';

describe('ClickToPayPaymentMethod', () => {
  let sut: ClickToPayPaymentMethod;
  let frameQueryingService: IFrameQueryingService;
  let requestProcessingInitializerMock: RequestProcessingInitializer;
  let requestProcessingServiceMock: IRequestProcessingService;
  const testConfig: IClickToPayConfig = {};
  const expectedEventObject: IMessageBusEvent<IClickToPayConfig> = {
    type: PUBLIC_EVENTS.CLICK_TO_PAY_INIT_CLIENT,
    data: testConfig,
  };

  beforeEach(() => {
    frameQueryingService = mock<IFrameQueryingService>();
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    when(requestProcessingInitializerMock.initialize()).thenReturn(of(null).pipe(mapTo(instance(requestProcessingServiceMock))));
    when(frameQueryingService.query(objectContaining(expectedEventObject), MERCHANT_PARENT_FRAME)).thenReturn(of(undefined));
    sut = new ClickToPayPaymentMethod(instance(frameQueryingService), instance(requestProcessingInitializerMock));
  });

  describe('init()', () => {
    it('should should publish ClickToPay payment method client initialization event via frame querying service', done => {
      sut.init(testConfig).subscribe(() => {
        verify(frameQueryingService.query(objectContaining(expectedEventObject), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });
});
