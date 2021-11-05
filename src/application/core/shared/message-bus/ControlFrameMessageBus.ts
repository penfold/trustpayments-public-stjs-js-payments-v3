import { Inject, Service } from 'typedi';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import IControlFrameWindow from '../../../../shared/interfaces/IControlFrameWindow';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';
import { EventScope } from '../../models/constants/EventScope';
import { SimpleMessageBus } from './SimpleMessageBus';

@Service()
export class ControlFrameMessageBus extends SimpleMessageBus {
  constructor(
    @Inject(WINDOW) private window: IControlFrameWindow,
    private interFrameCommunicator: InterFrameCommunicator
  ) {
    super(interFrameCommunicator.incomingEvent$);

    window.stMessages = this.asObservable();
  }

  publish<T>(event: IMessageBusEvent<T>, eventScope: EventScope = EventScope.THIS_FRAME): void {
    this.next(event);

    if (eventScope === EventScope.EXPOSED || eventScope === EventScope.ALL_FRAMES) {
      if (!this.isPublic(event)) {
        throw new Error(`Cannot publish private event "${event.type}" to parent frame.`);
      }
      this.interFrameCommunicator.sendToParentFrame(event);
    }
  }
}
