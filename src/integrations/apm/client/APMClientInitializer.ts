import { IMessageSubscriber } from '../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { Service } from 'typedi';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { APMClient } from './APMClient';
import { IAPMConfig } from '../models/IAPMConfig';

@Service({ id: MessageSubscriberToken, multiple: true })
export class APMClientInitializer implements IMessageSubscriber {
  constructor(
    private apmClient: APMClient,
    private frameQueryingService: IFrameQueryingService,
  ) {
  }

  register(): void {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.APM_INIT_CLIENT,
      (event: IMessageBusEvent<IAPMConfig>) => {
        return this.apmClient.init(event.data);
      },
    );
  }
}

