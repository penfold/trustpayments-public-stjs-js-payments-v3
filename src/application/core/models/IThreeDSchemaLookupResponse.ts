import { IResponseData } from './IResponseData';

export interface IThreeDSchemaLookupResponse extends IResponseData {
  transactionstartedtimestamp: string,
  errormessage: string,
  errorcode: string,
  requesttypedescription: string,
  customeroutput: string,
  threedstransactionid: string
  methodurl: string,
  notificationurl: string,
  threedversion: string
}
