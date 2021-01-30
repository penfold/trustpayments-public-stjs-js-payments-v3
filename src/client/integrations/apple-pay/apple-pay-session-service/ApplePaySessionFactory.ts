import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { IApplePaySessionWrapper } from './IApplePaySessionWrapper';

@Service()
export class ApplePaySessionFactory {
  constructor(private applePaySessionWrapper: IApplePaySessionWrapper) {}

  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return this.applePaySessionWrapper.createInstance(applePayVersion, applePayPaymentRequest);
  }
}
