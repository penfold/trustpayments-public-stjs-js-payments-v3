import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../../models/IApplePayPaymentRequest';
import { IApplePaySession } from '../../models/IApplePaySession';
import { IApplePaySessionWrapper } from '../../models/IApplePaySessionWrapper';

@Service()
export class ApplePaySessionFactory {
  constructor(private applePaySessionWrapper: IApplePaySessionWrapper) {}

  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return this.applePaySessionWrapper.createInstance(applePayVersion, applePayPaymentRequest);
  }
}
