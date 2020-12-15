import { IApplePayPaymentMethodSelectedEvent } from '../IApplePayPaymentMethodSelectedEvent';
import { IApplePayShippingMethodSelectedEvent } from '../IApplePayShippingMethodSelectedEvent';
import { IApplePayShippingContactSelectedEvent } from '../IApplePayShippingContactSelectedEvent';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';

const ApplePaySession = (window as any).ApplePaySession;

export class ApplePaySessionService {
  private applePaySession: any;
  private paymentRequest: IApplePayPaymentRequest;

  init(applePaySession: any, paymentRequest: IApplePayPaymentRequest) {
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
    const canMakePaymentsWithActiveCard: Promise<boolean> = ApplePaySession.canMakePaymentsWithActiveCard(
      merchantId
    ).then((canMakePayments: boolean) => canMakePayments);

    if (!canMakePaymentsWithActiveCard) {
      console.error('User has not an active card provisioned into Wallet');
    }

    return canMakePaymentsWithActiveCard;
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

  private beginMerchantValidation(): void {
    try {
      this.applePaySession.begin();
    } catch (error) {
      console.warn(error);
    }
  }
}
