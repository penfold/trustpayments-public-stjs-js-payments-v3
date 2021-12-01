import { IApplePayShippingBillingContact } from '../IApplePayShippingBillingContact';
import { IApplePayShippingContact } from '../IApplePayShippingContact';
import { IApplePayPaymentToken } from './IApplePayPaymentToken';

export interface IApplePayPayment {
  token: IApplePayPaymentToken;
  billingContact?: IApplePayShippingBillingContact;
  shippingContact?: IApplePayShippingContact;
}
