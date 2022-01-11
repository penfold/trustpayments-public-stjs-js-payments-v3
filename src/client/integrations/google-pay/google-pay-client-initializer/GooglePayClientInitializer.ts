import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { GooglePayClient } from '../GooglePayClient';
import { IFrameQueryingService } from '../../../../shared/services/message-bus/interfaces/IFrameQueryingService';

@Service({ id: MessageSubscriberToken, multiple: true })
export class GooglePayClientInitializer implements IMessageSubscriber {
  constructor(private googlePayClient: GooglePayClient, private frameQueryingService: IFrameQueryingService) {
  }

  register(messageBus: IMessageBus): void {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.GOOGLE_PAY_CLIENT_INIT,
      (event: IMessageBusEvent<IConfig>) => {
         return this.googlePayClient.init(event.data);
      }
    );
  }
}
