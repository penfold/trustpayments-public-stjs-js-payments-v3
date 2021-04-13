import { Service } from 'typedi';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { RequestType } from '../../../shared/types/RequestType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { TERM_URL } from '../../../application/core/models/constants/RequestData';

@Service()
export class GooglePayPaymentService {
  constructor(private messageBus: IMessageBus) {}

  processPayment(requestTypes: RequestType[], formData: object, payment: any): void {
    this.messageBus.publish<any>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          requestTypes,
          walletsource: 'GOOGLEPAY',
          wallettoken: JSON.stringify(payment),
          ...formData,
          termurl: TERM_URL
        },
        name: 'GooglePay'
      }
    });
  }
}
