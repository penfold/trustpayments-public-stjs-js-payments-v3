import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePaySessionFactory {
  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return new ApplePaySession(applePayVersion, applePayPaymentRequest);
  }
}
