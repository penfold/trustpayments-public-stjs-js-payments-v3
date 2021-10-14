import { IApplePaySession } from './../IApplePaySession';
import { IApplePayPaymentRequest } from './IApplePayPaymentRequest';

export interface IApplePaySessionConstructor {
  readonly STATUS_SUCCESS: number;
  readonly STATUS_FAILURE: number;
  readonly STATUS_INVALID_BILLING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_CONTACT: number;
  readonly STATUS_PIN_INCORRECT: number;
  readonly STATUS_PIN_LOCKOUT: number;
  readonly STATUS_PIN_REQUIRED: number;

  canMakePayments(): boolean;

  canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean>;

  supportsVersion(version: number): boolean;

  new (applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession;
}
