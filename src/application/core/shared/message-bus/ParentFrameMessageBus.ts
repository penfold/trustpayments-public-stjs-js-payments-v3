import { Service } from 'typedi';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { SimpleMessageBus } from './SimpleMessageBus';

@Service()
export class ParentFrameMessageBus extends SimpleMessageBus {
  constructor(private interFrameCommunicator: InterFrameCommunicator, private framesHub: FramesHub) {
    super(interFrameCommunicator.incomingEvent$);
  }

  publish<T>(event: IMessageBusEvent<T>, publishToParent?: boolean): void {
    super.publish(event, publishToParent);

    this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).subscribe(controlFrame => {
      try {
        this.interFrameCommunicator.send(event, controlFrame);
      } catch (e) {
        console.warn(`Cannot send event to ControlFrame. ${e.message}`);
      }
    });
  }
}
