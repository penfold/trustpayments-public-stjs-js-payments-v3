import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../apple-pay-payment-data/IApplePayPaymentRequest';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePaySessionFactory {
  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest) {
    return new ApplePaySession(applePayVersion, applePayPaymentRequest);
  }
}
