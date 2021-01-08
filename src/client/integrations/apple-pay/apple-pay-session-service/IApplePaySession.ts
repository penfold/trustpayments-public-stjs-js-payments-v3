import { IApplePayPaymentAuthorizationResult } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayPaymentMethodSelectedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentMethodSelectedEvent';
// tslint:disable-next-line:max-line-length
import { IApplePayShippingContactSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingContactSelectedEvent';
import { IApplePayShippingMethodSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingMethodSelectedEvent';
import { IApplePayValidateMerchantEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayPaymentMethodUpdate } from './IApplePayPaymentMethodUpdate';
import { IApplePayShippingContactUpdate } from './IApplePayShippingContactUpdate';
import { IApplePayShippingMethodUpdate } from './IApplePayShippingMethodUpdate';

export interface IApplePaySession extends EventTarget {
  readonly STATUS_SUCCESS: number;
  readonly STATUS_FAILURE: number;
  readonly STATUS_INVALID_BILLING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_CONTACT: number;
  readonly STATUS_PIN_INCORRECT: number;
  readonly STATUS_PIN_LOCKOUT: number;
  readonly STATUS_PIN_REQUIRED: number;

  oncancel: (event: Event) => void;

  onpaymentauthorized: (event: IApplePayPaymentAuthorizedEvent) => void;

  onpaymentmethodselected: (event: IApplePayPaymentMethodSelectedEvent) => void;

  onshippingcontactselected: (event: IApplePayShippingContactSelectedEvent) => void;

  onshippingmethodselected: (event: IApplePayShippingMethodSelectedEvent) => void;

  onvalidatemerchant: (event: IApplePayValidateMerchantEvent) => void;

  canMakePayments(): boolean;

  canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean>;

  openPaymentSetup(merchantId: string): Promise<boolean>;

  supportsVersion(version: number): boolean;

  abort(): void;

  begin(): void;

  completeMerchantValidation(merchantSession: any): void;

  completePayment(status: IApplePayPaymentAuthorizationResult): void;

  completePaymentMethodSelection(update: IApplePayPaymentMethodUpdate): void;

  completeShippingContactSelection(update: IApplePayShippingContactUpdate): void;

  completeShippingMethodSelection(update: IApplePayShippingMethodUpdate): void;
}
