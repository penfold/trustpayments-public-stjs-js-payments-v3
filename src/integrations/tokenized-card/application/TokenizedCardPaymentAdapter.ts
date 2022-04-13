import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtObj } from '../../../application/core/models/IStJwtObj';

@Service()
export class TokenizedCardPaymentAdapter {
  constructor(private messageBus: IMessageBus, private jwtDecoder: JwtDecoder) {
  }

  updateTokenizedJWT(updatedJwt: string) {
    if (!updatedJwt) {
      return;
    }

    this.checkJwt(updatedJwt)
    this.messageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_JWT_UPDATED, data: updatedJwt });
    this.messageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT });
  }

  private checkJwt(jwt: string): IStJwtObj{
   return this.jwtDecoder.decode(jwt)
  }
}
