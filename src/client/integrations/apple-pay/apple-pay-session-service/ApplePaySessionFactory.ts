import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { ILegacyApplePaySessionWrapper } from './ILegacyApplePaySessionWrapper';

@Service()
export class ApplePaySessionFactory {
  constructor(private applePaySessionWrapper: ILegacyApplePaySessionWrapper) {}

  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return this.applePaySessionWrapper.createInstance(applePayVersion, applePayPaymentRequest);
  }
}
