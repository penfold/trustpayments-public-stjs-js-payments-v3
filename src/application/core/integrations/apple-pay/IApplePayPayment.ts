import { IApplePayPaymentToken } from './IApplePayPaymentToken';
import { IApplePayBillingContact } from './IApplePayBillingContact';
import { IApplePayShippingContact } from './IApplePayShippingContact';

export interface IApplePayPayment {
  token: IApplePayPaymentToken;
  billingContact?: IApplePayBillingContact;
  shippingContact?: IApplePayShippingContact;
}
