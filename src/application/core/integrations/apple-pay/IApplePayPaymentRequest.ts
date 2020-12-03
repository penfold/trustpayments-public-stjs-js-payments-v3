import { IApplePayLineItem } from './IApplePayLineItem';
import { IApplePaySupportedNetworks } from './IApplePaySupportedNetworks';
import { RequestType } from '../../../../shared/types/RequestType';
import { IApplePayBillingContact } from './IApplePayBillingContact';
import { IApplePayShippingContact } from './IApplePayShippingContact';
import { IApplePayShippingMethod } from './IApplePayShippingMethod';

export interface IApplePayPaymentRequest {
  applicationData?: string;
  billingContact?: IApplePayBillingContact;
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: string[];
  shippingType?: any;
  shippingMethods?: IApplePayShippingMethod;
  shippingContact?: IApplePayShippingContact;
  supportedCountries?: any;
  supportedNetworks: IApplePaySupportedNetworks[];
  lineItems?: IApplePayLineItem[];
  requestTypes?: RequestType[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
  total: IApplePayLineItem;
}
