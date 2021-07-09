import { IApplePayShippingBillingContact } from '../../../client/integrations/apple-pay/apple-pay-shipping-data/IApplePayShippingBillingContact';
import { IApplePayShippingContact } from '../../../client/integrations/apple-pay/apple-pay-shipping-data/IApplePayShippingContact';
import { CustomerOutput } from './constants/CustomerOutput';
import { IRequestTypeResponse } from '../services/st-codec/interfaces/IRequestTypeResponse';

export interface IResponseData extends IRequestTypeResponse {
  errorcode?: string;
  errormessage?: string;
  customeroutput?: CustomerOutput;
  requesttypedescription?: string;
  threedresponse?: string;
  cachetoken?: string;
  billingContact?: IApplePayShippingBillingContact;
  shippingContact?: IApplePayShippingContact;
  jwt?: string;
  walletsource?: 'APPLEPAY' | 'VISACHECKOUT';
  errordata?: string[];
  merchantUrl?: string;
}
