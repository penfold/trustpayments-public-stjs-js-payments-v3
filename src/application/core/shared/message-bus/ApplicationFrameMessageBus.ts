import { SimpleMessageBus } from './SimpleMessageBus';
import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { Service } from 'typedi';
import { EventScope } from '../../models/constants/EventScope';

@Service()
export class ApplicationFrameMessageBus extends SimpleMessageBus {
  constructor(frameAccessor: FrameAccessor, private interFrameCommunicator: InterFrameCommunicator) {
    super(frameAccessor.getControlFrame().stMessages);
  }

  publish<T>(event: IMessageBusEvent<T>, eventScope: EventScope = EventScope.THIS_FRAME): void {
    this.interFrameCommunicator.sendToControlFrame(event);

    if (eventScope === EventScope.EXPOSED || eventScope === EventScope.ALL_FRAMES) {
      if (!this.isPublic(event)) {
        throw new Error(`Cannot publish private event "${event.type}" to parent frame.`);
      }
      this.interFrameCommunicator.sendToParentFrame(event);
    }
  }
}
