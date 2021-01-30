import { Service } from 'typedi';
import { APPLE_PAY_BUTTON_ID } from '../apple-pay-button-service/ApplePayButtonProperties';

@Service()
export class ApplePayGestureService {
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
  }
}
