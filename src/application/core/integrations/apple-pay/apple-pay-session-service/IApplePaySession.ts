import { IApplePayPaymentAuthorizedEvent } from '../IApplePayPaymentAuthorizedEvent';
import { IApplePayPaymentMethodSelectedEvent } from '../IApplePayPaymentMethodSelectedEvent';
import { IApplePayShippingContactSelectedEvent } from '../IApplePayShippingContactSelectedEvent';
import { IApplePayShippingMethodSelectedEvent } from '../IApplePayShippingMethodSelectedEvent';
import { IApplePayValidateMerchantEvent } from '../IApplePayValidateMerchantEvent';
import { IApplePayLineItem } from '../IApplePayLineItem';
import { IApplePayShippingMethod } from '../IApplePayShippingMethod';

export interface IApplePaySession extends EventTarget {
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

  completePayment(status: number): void;

  completePaymentMethodSelection(newTotal: IApplePayLineItem, newLineItems: IApplePayLineItem[]): void;

  completeShippingContactSelection(
    status: number,
    newShippingMethods: IApplePayShippingMethod[],
    newTotal: IApplePayLineItem,
    newLineItems: IApplePayLineItem[]
  ): void;

  completeShippingMethodSelection(status: number, newTotal: IApplePayLineItem, newLineItems: IApplePayLineItem[]): void;

  readonly STATUS_SUCCESS: number;
  readonly STATUS_FAILURE: number;
  readonly STATUS_INVALID_BILLING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_CONTACT: number;
  readonly STATUS_PIN_INCORRECT: number;
  readonly STATUS_PIN_LOCKOUT: number;
  readonly STATUS_PIN_REQUIRED: number;
}
