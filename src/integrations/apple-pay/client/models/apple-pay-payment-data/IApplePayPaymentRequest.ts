import { IApplePayMerchantCapabilities } from '../IApplePayMerchantCapabilities';
import { IApplePaySupportedNetworks } from '../apple-pay-networks-service/IApplePaySupportedNetworks';
import { IApplePayShippingLineItem } from '../IApplePayShippingLineItem';
import { IApplePayShippingBillingContact } from '../IApplePayShippingBillingContact';
import { IApplePayShippingMethod } from '../IApplePayShippingMethod';
import { IApplePayShippingContact } from '../IApplePayShippingContact';

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
