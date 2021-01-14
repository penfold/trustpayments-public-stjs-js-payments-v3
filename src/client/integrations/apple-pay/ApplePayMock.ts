import { ApplePay } from './ApplePay';
import { ApplePaySessionMock } from './apple-pay-session-service/ApplePaySessionMock';

export class ApplePayMock extends ApplePay {
  public paymentDetails: string;

  public ifApplePayIsAvailable() {
    return true;
  }

  public isUserLoggedToAppleAccount() {
    return true;
  }

  public checkApplePayWalletCardAvailability() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public getApplePaySessionObject() {
    return ApplePaySessionMock;
  }

  public getPaymentSuccessStatus() {
    return ApplePaySessionMock.STATUS_SUCCESS;
  }

  public getPaymentFailureStatus() {
    return ApplePaySessionMock.STATUS_FAILURE;
  }
}
