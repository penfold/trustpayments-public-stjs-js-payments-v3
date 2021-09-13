import { IMessageSubscriber } from '../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { Service } from 'typedi';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';
import { ApplePayClient } from './ApplePayClient';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IConfig } from '../../../shared/model/config/IConfig';

@Service({ id: MessageSubscriberToken, multiple: true })
export class ApplePayClientInitializer implements IMessageSubscriber {
  constructor(
    private applePayClient: ApplePayClient,
    private interFrameCommunicator: InterFrameCommunicator,
  ) {
  }

  register(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT)
      .thenRespond((event: IMessageBusEvent<IConfig>) => this.applePayClient.init(event.data));
  }
}
