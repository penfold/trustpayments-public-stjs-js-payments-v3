import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { TokenizedCardPaymentAdapter } from './TokenizedCardPaymentAdapter';

const messageBus = new SimpleMessageBus()

let tokenizedCardPaymentAdapter: TokenizedCardPaymentAdapter

const jwt = 'test'

describe('TokenizedCardPaymentAdapter', () => {

  beforeEach(() => {
    tokenizedCardPaymentAdapter = new TokenizedCardPaymentAdapter(messageBus)
    jest.spyOn(messageBus, 'publish');
    tokenizedCardPaymentAdapter.updateTokenizedJWT(jwt)
  })

  describe('on updateTokenizedJWT()', () => {
    it('should send the TOKENIZED_JWT_UPDATED event with new JWT', () => {
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.TOKENIZED_JWT_UPDATED, data: jwt })
    })

    it('should send the TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT event', () => {
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT })
    })
  })
})
