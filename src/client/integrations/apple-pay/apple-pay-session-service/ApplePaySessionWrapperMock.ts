import { IApplePaySessionWrapper } from './IApplePaySessionWrapper';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { Service } from 'typedi';
import { ApplePaySessionMock } from './ApplePaySessionMock';

@Service()
export class ApplePaySessionWrapperMock implements IApplePaySessionWrapper {
  isApplePaySessionAvailable(): boolean {
    return true;
  }

  canMakePayments(): boolean {
    return true;
  }

  canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  supportsVersion(version: number): boolean {
    return true;
  }

  createInstance(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return new ApplePaySessionMock();
  }
}
