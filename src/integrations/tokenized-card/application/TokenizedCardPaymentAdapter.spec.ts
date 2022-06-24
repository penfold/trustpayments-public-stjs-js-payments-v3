import { instance, mock } from 'ts-mockito';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { TokenizedCardPaymentAdapter } from './TokenizedCardPaymentAdapter';

const messageBus = new SimpleMessageBus();

let tokenizedCardPaymentAdapter: TokenizedCardPaymentAdapter;
let jwtDecoder: JwtDecoder;

const jwt = 'test';

describe('TokenizedCardPaymentAdapter', () => {

  beforeAll(() => {

    jwtDecoder = mock(JwtDecoder);
    tokenizedCardPaymentAdapter = new TokenizedCardPaymentAdapter(messageBus, instance(jwtDecoder));
    jest.spyOn(messageBus, 'publish');
  })

  describe('on updateTokenizedJWT()', () => {

    beforeEach(() => {
      tokenizedCardPaymentAdapter.updateTokenizedJWT(jwt);
    })

    it('should send the TOKENIZED_JWT_UPDATED event with new JWT', () => {
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.TOKENIZED_JWT_UPDATED, data: jwt });
    })

    it('should send the TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT event', () => {
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT });
    })
  })
})
