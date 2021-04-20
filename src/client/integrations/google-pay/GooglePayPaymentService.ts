import { Service } from 'typedi';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { RequestType } from '../../../shared/types/RequestType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { GooglePaymentMethodName, GooglePaymentMethodwalletsource } from '../../../integrations/google-pay/models/IGooglePaymentMethod';

@Service()
export class GooglePayPaymentService {
  constructor(private messageBus: IMessageBus) {}

  processPayment(requestTypes: RequestType[], formData: Record<string, unknown>, payment: any, resultStatus: PaymentStatus): void {
    this.messageBus.publish<any>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          requestTypes,
          walletsource: GooglePaymentMethodwalletsource,
          wallettoken: JSON.stringify(payment),
          ...formData,
          resultStatus,
        },
        name: GooglePaymentMethodName,
      },
    });
  }

  errorPayment(requestTypes: RequestType[], formData: Record<string, unknown>, errorCode = PaymentStatus.ERROR): void {
    this.messageBus.publish<any>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          ...formData,
          requestTypes,
          resultStatus: errorCode,
        },
        name: GooglePaymentMethodName,
      },
    });
  }
}
