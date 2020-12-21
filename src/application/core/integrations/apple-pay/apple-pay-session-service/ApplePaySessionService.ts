import { from, Observable } from 'rxjs';
import { Service } from 'typedi';
import { IApplePayPaymentMethodSelectedEvent } from '../apple-pay-payment-data/IApplePayPaymentMethodSelectedEvent';
import { IApplePayPaymentRequest } from '../apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { IApplePayShippingMethodSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingMethodSelectedEvent';
// tslint:disable-next-line:max-line-length
import { IApplePayShippingContactSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingContactSelectedEvent';
import { IApplePayPaymentAuthorizationResult } from '../apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';

const ApplePaySession: IApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePaySessionService {
  private applePaySession: IApplePaySession;
  private paymentRequest: IApplePayPaymentRequest;

  init(applePaySession: IApplePaySession, paymentRequest: IApplePayPaymentRequest): void {
    this.applePaySession = applePaySession;
    this.paymentRequest = paymentRequest;
    this.onPaymentMethodSelected();
    this.onShippingMethodSelected();
    this.onShippingContactSelected();
    this.beginMerchantValidation();
  }

  abortApplePaySession(): void {
    try {
      this.applePaySession.abort();
    } catch (error) {
      console.error(error);
    }
  }

  canMakePaymentsWithActiveCard(merchantId: string): Observable<boolean> {
    return from(ApplePaySession.canMakePaymentsWithActiveCard(merchantId));
  }

  completeMerchantValidation(walletsession: object): void {
    this.applePaySession.completeMerchantValidation(walletsession);
  }

  completePayment(status: IApplePayPaymentAuthorizationResult): void {
    this.applePaySession.completePayment(status);
  }

  getLatestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();

    return versions.find((version: number) => {
      return ApplePaySession.supportsVersion(version);
    });
  }

  private beginMerchantValidation(): void {
    try {
      this.applePaySession.begin();
    } catch (error) {
      console.warn(error);
    }
  }

  private onPaymentMethodSelected(): void {
    this.applePaySession.onpaymentmethodselected = (event: IApplePayPaymentMethodSelectedEvent) => {
      this.applePaySession.completePaymentMethodSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private onShippingContactSelected(): void {
    this.applePaySession.onshippingcontactselected = (event: IApplePayShippingContactSelectedEvent) => {
      this.applePaySession.completeShippingContactSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private onShippingMethodSelected(): void {
    this.applePaySession.onshippingmethodselected = (event: IApplePayShippingMethodSelectedEvent) => {
      this.applePaySession.completeShippingMethodSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }
}
