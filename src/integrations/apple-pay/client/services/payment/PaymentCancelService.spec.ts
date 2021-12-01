import { mock, instance, verify, deepEqual } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../../../application/core/models/IMessageBusEvent';
import { IMessageBus } from '../../../../../application/core/shared/message-bus/IMessageBus';
import { IApplePaySession } from '../../models/IApplePaySession';
import { PaymentCancelService } from './PaymentCancelService';

describe('PaymentCancelService', () => {
  let messageBus: IMessageBus;
  let messageBusMock: IMessageBus;
  let applePaySession: IApplePaySession;
  let applePaySessionMock: IApplePaySession;
  let paymentCancelService: PaymentCancelService;

  const cancelQueryEventMock: IMessageBusEvent<unknown> = {
    type: PUBLIC_EVENTS.APPLE_PAY_CANCELLED,
    data: undefined,
  };

  beforeEach(() => {
    applePaySessionMock = mock<IApplePaySession>();
    applePaySession = instance(applePaySessionMock);

    messageBusMock = mock<IMessageBus>();
    messageBus = instance(messageBusMock);
    paymentCancelService = new PaymentCancelService(messageBus);
  });

  describe('init()', () => {
    it('publish the event with payment cancel status', () => {
      paymentCancelService.init(applePaySession);
      applePaySession.oncancel(undefined);

      verify(messageBusMock.publish(deepEqual(cancelQueryEventMock))).once();
    });
  });
});
