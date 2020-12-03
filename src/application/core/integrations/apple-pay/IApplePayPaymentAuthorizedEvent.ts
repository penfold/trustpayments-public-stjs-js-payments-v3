import { IApplePayPaymentToken } from './IApplePayPaymentToken';
import { IApplePayBillingContact } from './IApplePayBillingContact';
import { IApplePayShippingContact } from './IApplePayShippingContact';

export interface IApplePayPaymentAuthorizedEvent {
  payment: {
    billingContact?: IApplePayBillingContact;
    shippingContact?: IApplePayShippingContact;
    token: IApplePayPaymentToken;
  };
}
