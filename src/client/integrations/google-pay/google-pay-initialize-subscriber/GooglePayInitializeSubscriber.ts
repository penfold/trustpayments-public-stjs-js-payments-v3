import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { GooglePay } from '../GooglePay';
import { IFrameQueryingService } from '../../../../shared/services/message-bus/interfaces/IFrameQueryingService';

@Service({ id: MessageSubscriberToken, multiple: true })
export class GooglePayInitializeSubscriber implements IMessageSubscriber {
  constructor(private googlePay: GooglePay, private frameQueryingService: IFrameQueryingService) {
  }

  register(messageBus: IMessageBus): void {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.GOOGLE_PAY_CLIENT_INIT,
      (event: IMessageBusEvent<IConfig>) => {
         return this.googlePay.init(event.data);
      }
    );
  }
}
