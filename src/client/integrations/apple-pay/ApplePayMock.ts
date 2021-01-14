import { Service } from 'typedi';
import { ApplePay } from './ApplePay';

@Service()
export class ApplePayMock extends ApplePay {
  paymentDetails: string;

  ifApplePayIsAvailable() {
    return true;
  }

  isUserLoggedToAppleAccount() {
    return true;
  }

  checkApplePayWalletCardAvailability() {
    return new Promise(resolve => {
      resolve(true);
    });
  }

  getPaymentSuccessStatus() {
    return 'SUCCESS';
  }

  getPaymentFailureStatus() {
    return 'FAILURE';
  }
}
