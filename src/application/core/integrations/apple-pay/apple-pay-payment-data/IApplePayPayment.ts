import { IApplePayPaymentToken } from './IApplePayPaymentToken';
import { IApplePayShippingBillingContact } from '../apple-pay-shipping-data/IApplePayShippingBillingContact';
import { IApplePayShippingContact } from '../apple-pay-shipping-data/IApplePayShippingContact';

export interface IApplePayPayment {
  token: IApplePayPaymentToken;
  billingContact?: IApplePayShippingBillingContact;
  shippingContact?: IApplePayShippingContact;
}
