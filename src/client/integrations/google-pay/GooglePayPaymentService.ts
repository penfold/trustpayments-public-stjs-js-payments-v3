import { Service } from 'typedi';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IPaymentData } from '../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { IGooglePayGatewayRequest } from '../../../integrations/google-pay/models/IGooglePayRequest';
import { RequestType } from '../../../shared/types/RequestType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import {
  GooglePaymentMethodName,
  GooglePaymentMethodwalletsource,
} from '../../../integrations/google-pay/models/IGooglePaymentMethod';
import { TERM_URL } from '../../../application/core/models/constants/RequestData';
import { PaymentResultHandler } from '../../../application/core/services/payments/PaymentResultHandler';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';

@Service()
export class GooglePayPaymentService {
  constructor(private messageBus: IMessageBus, private paymentResultHandler: PaymentResultHandler) {}

  processPayment(requestTypes: RequestType[], formData: Record<string, unknown>, payment: IPaymentData): void {
    this.messageBus.publish<IStartPaymentMethod<IGooglePayGatewayRequest>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          requestTypes,
          walletsource: GooglePaymentMethodwalletsource,
          wallettoken: JSON.stringify(payment),
          ...formData,
          termurl: TERM_URL,
        },
        name: GooglePaymentMethodName,
      },
    });
  }

  cancelPayment(requestTypes: RequestType[], formData: Record<string, unknown>): void {
    const result: IPaymentResult<any> = {
      status: PaymentStatus.CANCEL,
      data: {
        ...formData,
        requestTypes,
        resultStatus: PaymentStatus.CANCEL,
      },
    };
    this.paymentResultHandler.handle(result);
  }

  errorPayment(requestTypes: RequestType[], formData: Record<string, unknown>): void {
    const result: IPaymentResult<any> = {
      status: PaymentStatus.ERROR,
      data: {
        ...formData,
        requestTypes,
        resultStatus: PaymentStatus.ERROR,
      },
    };
    this.paymentResultHandler.handle(result);
  }
}
