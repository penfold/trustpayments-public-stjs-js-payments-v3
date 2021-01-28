import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { ApplePaySessionWrapper } from './ApplePaySessionWrapper';

@Service()
export class ApplePaySessionFactory {
  constructor(private applePaySessionWrapper: ApplePaySessionWrapper) {}

  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return this.applePaySessionWrapper.createInstance(applePayVersion, applePayPaymentRequest);
  }
}
