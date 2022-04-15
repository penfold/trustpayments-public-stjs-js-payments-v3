import { Service } from 'typedi';
import { IMessageSubscriber } from '../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { ITokenizedCardPaymentConfig } from '../models/ITokenizedCardPayment';
import { TokenizedCardClient } from './TokenizedCardClient';

@Service({ id: MessageSubscriberToken, multiple: true })
export class TokenizedCardClientInitializer implements IMessageSubscriber {
  constructor(
    private tokenizedCardClient: TokenizedCardClient,
    private frameQueryingService: IFrameQueryingService,
  ) {
  }

  register(): void {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.TOKENIZED_CARD_CLIENT_INIT,
      (event: IMessageBusEvent<ITokenizedCardPaymentConfig>) => this.tokenizedCardClient.init(event.data),
    );
  }
}
