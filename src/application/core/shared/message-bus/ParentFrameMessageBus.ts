import { ContainerInstance, Service } from 'typedi';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../models/constants/Selectors';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { EventScope } from '../../models/constants/EventScope';
import { FrameCommunicationError } from '../../../../shared/services/message-bus/errors/FrameCommunicationError';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { SimpleMessageBus } from './SimpleMessageBus';

@Service()
export class ParentFrameMessageBus extends SimpleMessageBus {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private framesHub: FramesHub,
    private container: ContainerInstance,
  ) {
    super(interFrameCommunicator.incomingEvent$);
  }

  publish<T>(event: IMessageBusEvent<T>, eventScope: EventScope = EventScope.THIS_FRAME): void {
    super.publish(event, eventScope);

    this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).subscribe(controlFrame => {
      try {
        this.interFrameCommunicator.send(event, controlFrame);
      } catch (e) {
        console.warn(`Cannot send event to ControlFrame. ${e.message}`);

        this.sentryService.sendCustomMessage(this.normalizeFrameCommunicationError(e, event));
      }
    });
  }

  private get sentryService(): SentryService {
    return this.container.get(SentryService);
  }

  private normalizeFrameCommunicationError(error: Error, event: IMessageBusEvent): FrameCommunicationError {
    if (error instanceof FrameCommunicationError) {
      return error;
    }

    return new FrameCommunicationError(
      'Cannot send event to ControlFrame',
      event,
      MERCHANT_PARENT_FRAME,
      CONTROL_FRAME_IFRAME,
      error
    );
  }
}
