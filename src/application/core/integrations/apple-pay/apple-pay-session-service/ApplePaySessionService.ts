import { Service } from 'typedi';
import { IApplePayPaymentMethodSelectedEvent } from '../IApplePayPaymentMethodSelectedEvent';
import { IApplePayShippingMethodSelectedEvent } from '../IApplePayShippingMethodSelectedEvent';
import { IApplePayShippingContactSelectedEvent } from '../IApplePayShippingContactSelectedEvent';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePaySessionService {
  private applePaySession: IApplePaySession;
  private paymentRequest: IApplePayPaymentRequest;

  init(applePaySession: IApplePaySession, paymentRequest: IApplePayPaymentRequest) {
    this.applePaySession = applePaySession;
    this.paymentRequest = paymentRequest;
    this.onPaymentMethodSelected();
    this.onShippingMethodSelected();
    this.onShippingContactSelected();
    this.beginMerchantValidation();
  }

  endMerchantValidation(): void {
    try {
      this.applePaySession.abort();
    } catch (error) {
      console.warn(error);
    }
  }

  getLatestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();
    return versions.find((version: number) => {
      return ApplePaySession.supportsVersion(version);
    });
  }

  canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean> {
    return ApplePaySession.canMakePaymentsWithActiveCard(merchantId);
  }

  private onPaymentMethodSelected(): void {
    this.applePaySession.onpaymentmethodselected = (event: IApplePayPaymentMethodSelectedEvent) => {
      this.applePaySession.completePaymentMethodSelection({
        amount: this.paymentRequest.total.amount,
        label: this.paymentRequest.total.label,
        type: 'final'
      });
    };
  }

  private onShippingMethodSelected(): void {
    this.applePaySession.onshippingmethodselected = (event: IApplePayShippingMethodSelectedEvent) => {
      this.applePaySession.completeShippingMethodSelection({
        amount: this.paymentRequest.total.amount,
        label: this.paymentRequest.total.label,
        type: 'final'
      });
    };
  }

  private onShippingContactSelected(): void {
    this.applePaySession.onshippingcontactselected = (event: IApplePayShippingContactSelectedEvent) => {
      this.applePaySession.completeShippingContactSelection({
        amount: this.paymentRequest.total.amount,
        label: this.paymentRequest.total.label,
        type: 'final'
      });
    };
  }

  private beginMerchantValidation(): void {
    try {
      this.applePaySession.begin();
    } catch (error) {
      console.warn(error);
    }
  }
}
