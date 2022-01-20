import { Service } from 'typedi';
import { CLICK_TO_PAY_FORM_CONFIRM } from '../../../../application/core/models/constants/Selectors';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { MessageBus } from '../../../../application/core/shared/message-bus/MessageBus';
import { EventScope } from '../../../../application/core/models/constants/EventScope';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
@Service()
export class ClickToPay {
  private formConfirmButton: HTMLButtonElement;

  constructor(private messageBus: IMessageBus) {
    this.init();
  }

  init(): void {
    this.submitFormListener();
  }

  private submitFormListener(): void {
    const clickHandler = () => this.publishSubmitEvent();
    this.formConfirmButton = document.getElementById(CLICK_TO_PAY_FORM_CONFIRM) as HTMLButtonElement;

    this.formConfirmButton.addEventListener('click', clickHandler);
  }

  private publishSubmitEvent(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: { some: 'some data' },
      type: MessageBus.EVENTS_PUBLIC.CLICK_TO_PAY_PAYLOAD_RECEIVED,
    };

    this.messageBus.publish(messageBusEvent, EventScope.ALL_FRAMES);
  }
}
