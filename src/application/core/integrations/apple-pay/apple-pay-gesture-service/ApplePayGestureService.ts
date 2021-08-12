import { Service } from 'typedi';
import { APPLE_PAY_BUTTON_ID } from '../apple-pay-button-service/ApplePayButtonProperties';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { ofType } from '../../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { first } from 'rxjs/operators';

@Service()
export class ApplePayGestureService {
  constructor(private messageBus: IMessageBus) {
  }

  gestureHandle(callback: () => void): void {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);

    if (!button) {
      throw new Error('There is no Apple Pay container in form');
    }

    const handler = () => {
      callback();
      button.removeEventListener('click', handler);
    };

    button.addEventListener('click', handler);

    this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY), first()).subscribe(() => {
      button.removeEventListener('click', handler);
    });
  }
}
