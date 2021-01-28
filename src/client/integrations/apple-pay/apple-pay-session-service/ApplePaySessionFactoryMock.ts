import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { ApplePaySessionServiceMock } from './ApplePaySessionServiceMock';
import { IApplePaySession } from './IApplePaySession';

@Service()
export class ApplePaySessionFactoryMock {
  create(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return new ApplePaySessionServiceMock({} as any, {} as any);
  }
}
