import { from, Observable } from 'rxjs';
import { Service } from 'typedi';
import { IApplePayPaymentMethodSelectedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentMethodSelectedEvent';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { IApplePayShippingMethodSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingMethodSelectedEvent';
import { IApplePayShippingContactSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingContactSelectedEvent';
import { IApplePayPaymentAuthorizationResult } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePaySessionWrapper } from './IApplePaySessionWrapper';

@Service()
export class ApplePaySessionService {
  private applePaySession: IApplePaySession;
  private paymentRequest: IApplePayPaymentRequest;

  constructor(private applePaySessionWrapper: IApplePaySessionWrapper) {}

  init(applePaySession: IApplePaySession, paymentRequest: IApplePayPaymentRequest): void {
    this.applePaySession = applePaySession;
    this.paymentRequest = paymentRequest;
    this.onPaymentMethodSelected();
    this.onShippingMethodSelected();
    this.onShippingContactSelected();
    this.beginMerchantValidation();
  }

  abort(): void {
    try {
      this.applePaySession.abort();
    } catch (error) {
      console.warn(error);
    }
  }

  hasApplePaySessionObject(): boolean {
    return this.applePaySessionWrapper.isApplePaySessionAvailable();
  }

  canMakePayments(): boolean {
    return this.applePaySessionWrapper.canMakePayments();
  }

  canMakePaymentsWithActiveCard(merchantId: string): Observable<boolean> {
    return from(this.applePaySessionWrapper.canMakePaymentsWithActiveCard(merchantId));
  }

  completeMerchantValidation(walletsession: string): void {
    this.applePaySession.completeMerchantValidation(JSON.parse(walletsession));
  }

  completePayment(status: IApplePayPaymentAuthorizationResult): void {
    this.applePaySession.completePayment(status);
  }

  getLatestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();

    return versions.find((version: number) => {
      return this.applePaySessionWrapper.supportsVersion(version);
    });
  }

  updatePaymentRequest(paymentRequest: IApplePayPaymentRequest): void {
    this.paymentRequest = paymentRequest;
  }

  private beginMerchantValidation(): void {
    try {
      this.applePaySession.begin();
    } catch (error) {
      console.warn(error);
    }
  }

  private onPaymentMethodSelected(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.applePaySession.onpaymentmethodselected = (event: IApplePayPaymentMethodSelectedEvent) => {
      this.applePaySession.completePaymentMethodSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: this.paymentRequest.total.type,
        },
      });
    };
  }

  private onShippingContactSelected(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.applePaySession.onshippingcontactselected = (event: IApplePayShippingContactSelectedEvent) => {
      this.applePaySession.completeShippingContactSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: this.paymentRequest.total.type,
        },
      });
    };
  }

  private onShippingMethodSelected(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.applePaySession.onshippingmethodselected = (event: IApplePayShippingMethodSelectedEvent) => {
      this.applePaySession.completeShippingMethodSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: this.paymentRequest.total.type,
        },
      });
    };
  }
}
