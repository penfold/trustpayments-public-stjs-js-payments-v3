import { Service } from 'typedi';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';

@Service()
export class TokenizedCardPaymentAdapter {
  constructor(private messageBus: IMessageBus) {
  }

  updateTokenizedJWT(updatedJwt: string) {
    if (!updatedJwt) {
      return;
    }
    console.log('TOKEN TokenizedCardPaymentAdapter - Tokenized JWT', updatedJwt)
  }
}
