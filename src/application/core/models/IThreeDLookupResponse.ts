import { IResponseData } from './IResponseData';

export interface IThreeDLookupResponse extends IResponseData {
  transactionstartedtimestamp: string,
  errormessage: string,
  errorcode: string,
  requesttypedescription: string,
  customeroutput: string,
  threedstransactionid: string
  threedmethodurl: string,
  threednotificationurl: string,
  threedversion: string
}
