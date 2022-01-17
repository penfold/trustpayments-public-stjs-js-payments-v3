import { IApplePayMerchantCapabilities } from './IApplePayMerchantCapabilities';
import { IApplePayShippingLineItem } from './IApplePayShippingLineItem';
import { IApplePaySupportedNetworks } from './IApplePaySupportedNetworks';
import { IApplePayShippingBillingContact } from './IApplePayShippingBillingContact';
import { IApplePayShippingContact } from './IApplePayShippingContact';
import { IApplePayShippingMethod } from './IApplePayShippingMethod';

export interface IApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: IApplePayMerchantCapabilities[];
  supportedNetworks: IApplePaySupportedNetworks[];
  total: IApplePayShippingLineItem;
  lineItems?: IApplePayShippingLineItem[];
  applicationData?: string;
  billingContact?: IApplePayShippingBillingContact;
  shippingType?: string;
  shippingMethods?: IApplePayShippingMethod;
  shippingContact?: IApplePayShippingContact;
  supportedCountries?: string[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
}
