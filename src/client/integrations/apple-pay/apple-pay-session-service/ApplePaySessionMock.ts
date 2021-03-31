import { IApplePaySession } from './IApplePaySession';
import { IApplePayPaymentAuthorizedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayPaymentMethodSelectedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentMethodSelectedEvent';
import { IApplePayShippingContactSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingContactSelectedEvent';
import { IApplePayShippingMethodSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingMethodSelectedEvent';
import { IApplePayValidateMerchantEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayPaymentAuthorizationResult } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayShippingContactUpdate } from './IApplePayShippingContactUpdate';
import { IApplePayPaymentMethodUpdate } from './IApplePayPaymentMethodUpdate';
import { IApplePayShippingMethodUpdate } from './IApplePayShippingMethodUpdate';
import { environment } from '../../../../environments/environment';

export class ApplePaySessionMock implements IApplePaySession {
  oncancel: (event: Event) => void;
  onpaymentauthorized: (event: IApplePayPaymentAuthorizedEvent) => void;
  publiconpaymentmethodselected: (event: IApplePayPaymentMethodSelectedEvent) => void;
  onshippingcontactselected: (event: IApplePayShippingContactSelectedEvent) => void;
  onshippingmethodselected: (event: IApplePayShippingMethodSelectedEvent) => void;
  onvalidatemerchant: (event: IApplePayValidateMerchantEvent) => void;
  onpaymentmethodselected: (event: IApplePayPaymentMethodSelectedEvent) => void;

  begin(): void {
    fetch(environment.APPLE_PAY_URLS.MOCK_DATA_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        if (data.status === 'SUCCESS') {
          this.onpaymentauthorized(data);
        } else {
          this.oncancel(data);
        }
      });
  }

  abort(): void {
    console.log('abort() called');
  }

  completeMerchantValidation(merchantSession: any): void {
    console.log('completeMerchantValidation() called');
  }

  completePayment(status: IApplePayPaymentAuthorizationResult): void {
    console.log('completePayment() called');
  }

  completePaymentMethodSelection(update: IApplePayPaymentMethodUpdate): void {
    console.log('completePaymentMethodSelection() called');
  }

  completeShippingContactSelection(update: IApplePayShippingContactUpdate): void {
    console.log('completeShippingContactSelection() called');
  }

  completeShippingMethodSelection(update: IApplePayShippingMethodUpdate): void {
    console.log('completeShippingMethodSelection() called');
  }

  openPaymentSetup(merchantId: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}
