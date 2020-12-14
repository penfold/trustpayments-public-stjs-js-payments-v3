import { IApplePayLineItem } from './IApplePayLineItem';
import { IApplePaySupportedNetworks } from './IApplePaySupportedNetworks';
import { RequestType } from '../../../../shared/types/RequestType';
import { IApplePayBillingContact } from './IApplePayBillingContact';
import { IApplePayShippingContact } from './IApplePayShippingContact';
import { IApplePayShippingMethod } from './IApplePayShippingMethod';

export interface IApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: string[];
  supportedNetworks: IApplePaySupportedNetworks[];
  total: IApplePayLineItem;
  lineItems?: IApplePayLineItem[];
  applicationData?: string;
  billingContact?: IApplePayBillingContact;
  shippingType?: string;
  shippingMethods?: IApplePayShippingMethod;
  shippingContact?: IApplePayShippingContact;
  supportedCountries?: string;
  requestTypes?: RequestType[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
}
