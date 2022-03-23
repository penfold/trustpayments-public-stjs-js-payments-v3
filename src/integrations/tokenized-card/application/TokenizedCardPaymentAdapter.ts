import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';

@Service()
export class TokenizedCardPaymentAdapter {
  constructor(private messageBus: IMessageBus) {
  }

  updateTokenizedJWT(newJWT: string) {
    if(!newJWT) {
      return;
    }

    this.messageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_JWT_UPDATED, data: newJWT });
    this.messageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT });
  }
}
