import { IApplePayPaymentToken } from './IApplePayPaymentToken';
import { IApplePayShippingBillingContact } from './IApplePayShippingBillingContact';
import { IApplePayShippingContact } from './IApplePayShippingContact';

export interface IApplePayPayment {
  token: IApplePayPaymentToken;
  billingContact?: IApplePayShippingBillingContact;
  shippingContact?: IApplePayShippingContact;
}
