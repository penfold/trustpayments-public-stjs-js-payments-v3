import { IResponseData } from './IResponseData';
import { CustomerOutput } from './constants/CustomerOutput';

export interface IThreeDLookupResponse extends IResponseData {
  transactionstartedtimestamp: string;
  errormessage: string;
  errorcode: string;
  requesttypedescription: string;
  customeroutput: CustomerOutput;
  threedstransactionid: string;
  threedmethodurl: string;
  threednotificationurl: string;
  threedversion: string;
  paymenttypedescription: 'VISA' | 'MASTERCARD';
}
