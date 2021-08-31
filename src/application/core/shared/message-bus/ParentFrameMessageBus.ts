import { Service } from 'typedi';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { SimpleMessageBus } from './SimpleMessageBus';
import { EventScope } from '../../models/constants/EventScope';

@Service()
export class ParentFrameMessageBus extends SimpleMessageBus {
  constructor(private interFrameCommunicator: InterFrameCommunicator, private framesHub: FramesHub) {
    super(interFrameCommunicator.incomingEvent$);
  }

  publish<T>(event: IMessageBusEvent<T>, eventScope: EventScope = EventScope.THIS_FRAME): void {
    super.publish(event, eventScope);

    this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).subscribe(controlFrame => {
      try {
        this.interFrameCommunicator.send(event, controlFrame);
      } catch (e) {
        console.warn(`Cannot send event to ControlFrame. ${e.message}`);
      }
    });
  }
}
