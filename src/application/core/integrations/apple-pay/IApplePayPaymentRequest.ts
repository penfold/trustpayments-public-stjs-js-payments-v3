import { IApplePayLineItem } from './IApplePayLineItem';
import { IApplePaySupportedNetworks } from './IApplePaySupportedNetworks';
import { RequestType } from '../../../../shared/types/RequestType';

export interface IApplePayPaymentRequest {
  applicationData?: string;
  billingContact?: any;
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: string[];
  shippingType?: any;
  shippingMethods?: any;
  shippingContact?: any;
  supportedCountries?: any;
  supportedNetworks: IApplePaySupportedNetworks[];
  lineItems?: IApplePayLineItem[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
  total: IApplePayLineItem;
}
