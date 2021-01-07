import { IApplePayPaymentToken } from './IApplePayPaymentToken';
import { IApplePayShippingBillingContact } from '../../../../../client/integrations/apple-pay/apple-pay-shipping-data/IApplePayShippingBillingContact';
import { IApplePayShippingContact } from '../../../../../client/integrations/apple-pay/apple-pay-shipping-data/IApplePayShippingContact';

export interface IApplePayPayment {
  token: IApplePayPaymentToken;
  billingContact?: IApplePayShippingBillingContact;
  shippingContact?: IApplePayShippingContact;
}
