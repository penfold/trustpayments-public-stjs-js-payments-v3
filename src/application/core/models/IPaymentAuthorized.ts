import { RequestType } from '../../../shared/types/RequestType';

export interface IPaymentAuthorized {
  accounttypedescription: string;
  acquirerresponsecode: string;
  acquirertransactionreference: string;
  acsurl: string;
  customeroutput: string;
  dccenabled: string;
  enrolled: string;
  errorcode: string;
  errormessage: string;
  issuer: string;
  issuercountryiso2a: string;
  jwt: string;
  livestatus: string;
  maskedpan: string;
  merchantcountryiso2a: string;
  merchantname: string;
  merchantnumber: string;
  operatorname: string;
  paymenttypedescription: string;
  requesttypedescription: RequestType;
  settleduedate: string;
  settlestatus: string;
  status: string;
  threedpayload: string;
  threedversion: string;
  threedresponse?: string;
  tid: string;
  transactionreference: string;
  transactionstartedtimestamp: string;
  walletsource?: string;
  isCancelled?: boolean;
}
