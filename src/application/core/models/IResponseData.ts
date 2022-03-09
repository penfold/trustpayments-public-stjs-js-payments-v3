import { IApplePayShippingBillingContact } from '../../../integrations/apple-pay/client/models/IApplePayShippingBillingContact';
import { IApplePayShippingContact } from '../../../integrations/apple-pay/client/models/IApplePayShippingContact';
import { IRequestTypeResponse } from '../services/st-codec/interfaces/IRequestTypeResponse';
import { CustomerOutput } from './constants/CustomerOutput';

export interface IResponseData extends IRequestTypeResponse {
  billingContact?: IApplePayShippingBillingContact;
  cachetoken?: string;
  customeroutput?: CustomerOutput;
  errorcode?: string;
  errordata?: string[];
  errormessage?: string;
  isCancelled?: boolean;
  jwt?: string;
  md?: string;
  merchantUrl?: string;
  pares?: string;
  requestreference?: string;
  requesttypedescription?: string;
  shippingContact?: IApplePayShippingContact;
  threedresponse?: string;
  walletsource?: 'APPLEPAY' | 'VISACHECKOUT';
}
