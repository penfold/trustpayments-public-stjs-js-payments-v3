import { Service } from 'typedi';
import { ApplePay } from './ApplePay';

@Service()
export class ApplePayMock extends ApplePay {
  paymentDetails: string;

  ifApplePayIsAvailable(): boolean {
    return true;
  }

  isUserLoggedToAppleAccount(): boolean {
    return true;
  }

  checkApplePayWalletCardAvailability(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getPaymentSuccessStatus(): string {
    return 'SUCCESS';
  }

  getPaymentFailureStatus(): string {
    return 'FAILURE';
  }
}
