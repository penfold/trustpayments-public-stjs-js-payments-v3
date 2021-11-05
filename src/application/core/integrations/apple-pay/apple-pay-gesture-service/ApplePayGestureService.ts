import { Service } from 'typedi';
import { first } from 'rxjs/operators';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { ofType } from '../../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';

@Service()
export class ApplePayGestureService {
  constructor(private messageBus: IMessageBus) {
  }

  gestureHandle(callback: () => void, appleButtonPlacement: string): void {
    const button = document.getElementById(appleButtonPlacement);

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
