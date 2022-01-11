import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { ClickToPayPaymentMethod } from './ClickToPayPaymentMethod';

describe('ClickToPayPaymentMethod', () => {
  let sut: ClickToPayPaymentMethod;
  let frameQueryingService: IFrameQueryingService;

  beforeEach(() => {
    frameQueryingService = mock<IFrameQueryingService>();
    when(frameQueryingService.query(anything(), anything())).thenReturn(of(null));
    sut = new ClickToPayPaymentMethod(instance(frameQueryingService));
  });

  describe('init()', () => {
    it('should should publish ClickToPay payment method client initialization event via frame querying service', done => {
      const testConfig: IClickToPayConfig = {};
      const expectedEventObject: IMessageBusEvent<IClickToPayConfig> = {
        type: PUBLIC_EVENTS.CLICK_TO_PAY_INIT_CLIENT,
        data: testConfig,
      };
      sut.init(testConfig).subscribe(() => {
        verify(frameQueryingService.query(objectContaining(expectedEventObject), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });
});
