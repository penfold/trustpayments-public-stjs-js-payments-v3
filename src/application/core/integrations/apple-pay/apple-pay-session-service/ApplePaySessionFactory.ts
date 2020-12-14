import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePaySessionFactory {
  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest) {
    return new ApplePaySession(applePayVersion, applePayPaymentRequest);
  }
}
