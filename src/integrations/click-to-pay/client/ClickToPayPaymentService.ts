import { Service } from 'typedi';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IClickToPayGatewayRequest } from '../models/ClickToPayGatewayRequest';
import { ClickToPayPaymentMethodName } from '../models/ClickToPayPaymentMethodName';
import { IClickToPayConfig } from '../models/IClickToPayConfig';

@Service()
export class ClickToPayPaymentService {
  constructor(
    private messageBus: IMessageBus,
  ) {}

  processPayment(config: IClickToPayConfig): void {
    this.messageBus.publish<IStartPaymentMethod<IClickToPayGatewayRequest>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
        },
        name: ClickToPayPaymentMethodName,
      },
    });
  }
}
