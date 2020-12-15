import { IApplePayBillingContact } from '../integrations/apple-pay/apple-pay-payment-data/IApplePayBillingContact';
import { IApplePayShippingContact } from '../integrations/apple-pay/apple-pay-payment-data/IApplePayShippingContact';

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
  errordata?: object;
}
