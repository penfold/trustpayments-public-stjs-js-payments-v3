import { IMessageSubscriber } from '../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { Service } from 'typedi';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';
import { ApplePayClient } from './ApplePayClient';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';

@Service({ id: MessageSubscriberToken, multiple: true })
export class ApplePayClientInitializer implements IMessageSubscriber {
  constructor(
    private applePayClient: ApplePayClient,
    private frameQueryingService: IFrameQueryingService,
  ) {
  }

  register(): void {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT,
      (event: IMessageBusEvent<IConfig>) => this.applePayClient.init(event.data),
    );
  }
}
