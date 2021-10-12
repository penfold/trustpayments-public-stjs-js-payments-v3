import { IApplePaySessionWrapper } from './interfaces/IApplePaySessionWrapper';
import { IApplePayPaymentRequest } from './interfaces/IApplePayPaymentRequest';
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
