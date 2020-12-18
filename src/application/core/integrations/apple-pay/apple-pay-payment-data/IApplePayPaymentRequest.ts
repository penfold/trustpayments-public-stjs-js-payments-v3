import { IApplePayShippingLineItem } from '../apple-pay-shipping-data/IApplePayShippingLineItem';
import { IApplePaySupportedNetworks } from '../apple-pay-networks-service/IApplePaySupportedNetworks';
import { IApplePayShippingBillingContact } from '../apple-pay-shipping-data/IApplePayShippingBillingContact';
import { IApplePayShippingContact } from '../apple-pay-shipping-data/IApplePayShippingContact';
import { IApplePayShippingMethod } from '../apple-pay-shipping-data/IApplePayShippingMethod';

export interface IApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: string[];
  supportedNetworks: IApplePaySupportedNetworks[];
  total: IApplePayShippingLineItem;
  lineItems?: IApplePayShippingLineItem[];
  applicationData?: string;
  billingContact?: IApplePayShippingBillingContact;
  shippingType?: string;
  shippingMethods?: IApplePayShippingMethod;
  shippingContact?: IApplePayShippingContact;
  supportedCountries?: string;
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
}
