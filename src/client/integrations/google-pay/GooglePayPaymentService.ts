import { Service } from 'typedi';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { RequestType } from '../../../shared/types/RequestType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';

@Service()
export class GooglePayPaymentService {
  constructor(private messageBus: IMessageBus) {}

  processPayment(requestTypes: RequestType[], formData: Record<string, unknown>, payment: any): void {
    this.messageBus.publish<any>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          requestTypes,
          walletsource: 'GOOGLEPAY',
          wallettoken: JSON.stringify(payment),
          ...formData,
          resultStatus: PaymentStatus.SUCCESS,
        },
        name: 'GooglePay',
      },
    });
  }

  errorPayment(requestTypes: RequestType[], formData: Record<string, unknown>, errorCode = PaymentStatus.ERROR) {
    this.messageBus.publish<any>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          ...formData,
          requestTypes,
          resultStatus: errorCode,
        },
        name: 'GooglePay',
      },
    });
  }
}
