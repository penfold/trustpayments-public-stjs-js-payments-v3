import { Service } from 'typedi';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IPaymentData } from '../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { IGooglePayGatewayRequest } from '../../../integrations/google-pay/models/IGooglePayRequest';
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

  processPayment(formData: Record<string, unknown>, payment: IPaymentData): void {
    this.messageBus.publish<IStartPaymentMethod<IGooglePayGatewayRequest>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          walletsource: GooglePaymentMethodwalletsource,
          wallettoken: JSON.stringify(payment),
          ...formData,
          termurl: TERM_URL,
        },
        name: GooglePaymentMethodName,
      },
    });
  }

  cancelPayment(formData: Record<string, unknown>): void {
    const result: IPaymentResult<unknown> = {
      status: PaymentStatus.CANCEL,
      data: {
        ...formData,
        errormessage: PaymentStatus.CANCEL,
        errorcode: '1',
        walletsource: GooglePaymentMethodwalletsource,
      },
    };
    this.paymentResultHandler.handle(result);
  }

  errorPayment(formData: Record<string, unknown>): void {
    const result: IPaymentResult<unknown> = {
      status: PaymentStatus.ERROR,
      data: {
        ...formData,
        errormessage: PaymentStatus.ERROR,
        errorcode: '1',
        walletsource: GooglePaymentMethodwalletsource,
      },
    };
    this.paymentResultHandler.handle(result);
  }
}
