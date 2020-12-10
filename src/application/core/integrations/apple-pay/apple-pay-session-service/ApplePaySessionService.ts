import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePaySessionService {
  constructor(private applePayVersion: number, private applePayPaymentRequest: IApplePayPaymentRequest) {}

  create() {
    return new ApplePaySession(this.applePayVersion, this.applePayPaymentRequest);
  }
}
