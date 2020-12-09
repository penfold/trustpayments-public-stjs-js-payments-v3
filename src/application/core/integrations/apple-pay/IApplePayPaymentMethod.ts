import { IApplePayBillingContact } from './IApplePayBillingContact';
import { IApplePayPaymentPass } from './IApplePayPaymentPass';

export interface IApplePayPaymentMethod {
  displayName: string;
  network: string;
  type: 'debit' | 'credit' | 'prepaid' | 'store';
  paymentPass: IApplePayPaymentPass;
  billingContact: IApplePayBillingContact;
}
