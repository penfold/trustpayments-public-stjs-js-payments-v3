import { IResponseData } from './IResponseData';

export interface IThreeDQueryResponse extends IResponseData {
  jwt: string;
  acquirertransactionreference: string;
  acquirerresponsecode: string;
  acquirerresponsemessage: string;
  acsurl: string;
  enrolled: string;
  threedpayload: string;
  transactionreference: string;
  threedresponse?: string;
  cachetoken?: string;
  requesttypescription: string;
}
