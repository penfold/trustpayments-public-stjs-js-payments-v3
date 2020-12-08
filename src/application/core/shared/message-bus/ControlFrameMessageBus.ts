import { SimpleMessageBus } from './SimpleMessageBus';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { IControlFrameWindow } from '../../../../shared/interfaces/IControlFrameWindow';
import { Inject, Service } from 'typedi';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';

@Service()
export class ControlFrameMessageBus extends SimpleMessageBus {
  constructor(
    @Inject(WINDOW) private window: IControlFrameWindow,
    private interFrameCommunicator: InterFrameCommunicator
  ) {
    super(interFrameCommunicator.incomingEvent$);

    window.stMessages = this.asObservable();
  }

  publish<T>(event: IMessageBusEvent<T>, publishToParent?: boolean): void {
    this.next(event);

    if (publishToParent) {
      if (!this.isPublic(event)) {
        throw new Error(`Cannot publish private event "${event.type}" to parent frame.`);
      }
      this.interFrameCommunicator.sendToParentFrame(event);
    }
  }
}
