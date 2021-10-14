import { Service } from 'typedi';
import { IApplePaySession } from './IApplePaySession';
import { IApplePayPaymentRequest } from './interfaces/IApplePayPaymentRequest';
import { IApplePaySessionWrapper } from './interfaces/IApplePaySessionWrapper';

@Service()
export class ApplePaySessionFactory {
  constructor(private applePaySessionWrapper: IApplePaySessionWrapper) {}

  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return this.applePaySessionWrapper.createInstance(applePayVersion, applePayPaymentRequest);
  }
}
