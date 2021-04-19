import { IApplePayShippingBillingContact } from '../../../client/integrations/apple-pay/apple-pay-shipping-data/IApplePayShippingBillingContact';
import { IApplePayShippingContact } from '../../../client/integrations/apple-pay/apple-pay-shipping-data/IApplePayShippingContact';

export interface IResponseData {
  errorcode?: string;
  errormessage?: string;
  customeroutput?: any;
  requesttypedescription?: string;
  threedresponse?: string;
  cachetoken?: string;
  billingContact?: IApplePayShippingBillingContact;
  shippingContact?: IApplePayShippingContact;
  jwt?: string;
  walletsource?: 'APPLEPAY' | 'VISACHECKOUT';
  errordata?: Record<string, unknown>;
  merchantUrl?: string;
}
