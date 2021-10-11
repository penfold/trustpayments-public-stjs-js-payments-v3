import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IApplePaySession } from './IApplePaySession';

@Service()
export class PaymentCancelService {
  constructor(
    private messageBus: IMessageBus,
  ) {}

  init(applePaySession: IApplePaySession): void {
    applePaySession.oncancel = () => {
      const cancelQueryEvent: IMessageBusEvent<unknown> = {
        type: PUBLIC_EVENTS.APPLE_PAY_CANCELLED,
        data: undefined,
      };

      this.messageBus.publish(cancelQueryEvent);
    };
  }
}
