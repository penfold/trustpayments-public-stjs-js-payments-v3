import { FrameIdentifier } from '../../../../shared/services/message-bus/FrameIdentifier';
import { ContainerInstance, Service } from 'typedi';
import { IMessageBus } from './IMessageBus';
import { ParentFrameMessageBus } from './ParentFrameMessageBus';
import { ControlFrameMessageBus } from './ControlFrameMessageBus';
import { ApplicationFrameMessageBus } from './ApplicationFrameMessageBus';

@Service()
export class MessageBusFactory {
  constructor(private frameIdentifier: FrameIdentifier, private container: ContainerInstance) {}

  create(): IMessageBus{
    if (this.frameIdentifier.isParentFrame()) {
      return this.container.get(ParentFrameMessageBus);
    }

    if (this.frameIdentifier.isControlFrame()) {
      return this.container.get(ControlFrameMessageBus);
    }

    return this.container.get(ApplicationFrameMessageBus);
  }
}
