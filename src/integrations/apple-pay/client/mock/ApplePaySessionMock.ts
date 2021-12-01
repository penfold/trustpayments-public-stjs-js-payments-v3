import { environment } from '../../../../environments/environment';
import { IApplePayPaymentAuthorizationResult } from '../models/IApplePayPaymentAuthorizationResult';
import { IApplePayPaymentAuthorizedEvent } from '../models/IApplePayPaymentAuthorizedEvent';
import { IApplePaySession } from '../models/IApplePaySession';
import { IApplePayValidateMerchantEvent } from '../models/IApplePayValidateMerchantEvent';
import { ApplePayPopupMock } from './ApplePayPopupMock';

export class ApplePaySessionMock implements IApplePaySession {
  private applePayPopupMock: ApplePayPopupMock = new ApplePayPopupMock();

  oncancel: (event: Event) => void;
  onpaymentauthorized: (event: IApplePayPaymentAuthorizedEvent) => void;
  onvalidatemerchant: (event: IApplePayValidateMerchantEvent) => void;
  
  constructor() {
    this.proceedPayment = this.proceedPayment.bind(this);
  }

  begin(): void {
    this.applePayPopupMock.display(this);
    this.onvalidatemerchant({ validationURL: 'https://webservices.securetrading.net:6443/jwt/' });
  }

  abort(): void {
    this.applePayPopupMock.close(this);
    console.log('abort() called');
  }

  proceedPayment() {
    fetch(environment.APPLE_PAY_URLS.MOCK_DATA_URL)
    .then((response) => {
      return response.json();
    })
    // Intentionally left as `any` b/c it's a response from wiremock that doesn't really match any ApplePay types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((data: any) => {
      console.log('proceedPayment', data);
      if (data.status === 'SUCCESS') {
        this.onpaymentauthorized(data);
      } else {
        this.oncancel(data);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  completeMerchantValidation(merchantSession: unknown): void {
    this.applePayPopupMock.unlockAuthorizePaymentButton();
    console.log('completeMerchantValidation() called');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  completePayment(status: IApplePayPaymentAuthorizationResult): void {
    this.applePayPopupMock.close(this);
    console.log('completePayment() called');
  }
}
