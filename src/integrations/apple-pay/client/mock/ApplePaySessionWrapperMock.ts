import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../models/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from '../models/IApplePaySession';
import { IApplePaySessionWrapper } from '../models/IApplePaySessionWrapper';
import { ApplePaySessionMock } from './ApplePaySessionMock';

@Service()
export class ApplePaySessionWrapperMock implements IApplePaySessionWrapper {
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
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLatestSupportedApplePayVersion(): number {
    return 2;
  }
}
