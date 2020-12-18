import { Service } from 'typedi';
import { APPLE_PAY_BUTTON_ID } from '../apple-pay-button-service/ApplePayButtonProperties';

@Service()
export class ApplePayGestureService {
  gestureHandle(callback: () => void): void {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);

    const handler = () => {
      callback();
      button.removeEventListener('click', handler);
    };

    if (button) {
      button.addEventListener('click', handler);
    }
  }
}
