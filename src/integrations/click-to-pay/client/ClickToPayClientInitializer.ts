import { Service } from 'typedi';
import { IMessageSubscriber } from '../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { ClickToPayClient } from './ClickToPayClient';

@Service({ id: MessageSubscriberToken, multiple: true })
export class ClickToPayClientInitializer implements IMessageSubscriber {
  constructor(private frameQueryingService: IFrameQueryingService,
              private clickToPayClient: ClickToPayClient) {
  }

  register(): void {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.CLICK_TO_PAY_INIT_CLIENT,
      (event: IMessageBusEvent<IClickToPayConfig>) => {
        return this.clickToPayClient.init(event.data);
      }
    );
  }

}
