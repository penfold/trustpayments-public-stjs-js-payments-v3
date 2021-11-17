import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { ILegacyApplePaySessionWrapper } from './ILegacyApplePaySessionWrapper';
import { IApplePaySession } from './IApplePaySession';
import { ApplePaySessionMock } from './ApplePaySessionMock';

@Service()
export class LegacyApplePaySessionWrapperMock implements ILegacyApplePaySessionWrapper {
  isApplePaySessionAvailable(): boolean {
    return true;
  }

  canMakePayments(): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  supportsVersion(version: number): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createInstance(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    return new ApplePaySessionMock();
  }
}
