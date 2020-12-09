import { IApplePayBillingContact } from '../integrations/apple-pay/IApplePayBillingContact';
import { IApplePayShippingContact } from '../integrations/apple-pay/IApplePayShippingContact';

export interface IResponseData {
  errorcode?: string;
  errormessage?: string;
  customeroutput?: any;
  requesttypedescription?: string;
  threedresponse?: string;
  cachetoken?: string;
  billingContact?: IApplePayBillingContact;
  shippingContact?: IApplePayShippingContact;
  jwt?: string;
  walletsource?: 'APPLEPAY' | 'VISACHECKOUT';
  errordata: object;
}
