import { IResponseData } from './IResponseData';
import { Enrolled } from './constants/Enrolled';

export interface IThreeDQueryResponse extends IResponseData {
  jwt: string;
  acquirertransactionreference: string;
  acquirerresponsecode: string;
  acquirerresponsemessage: string;
  acsurl: string;
  enrolled: Enrolled | string;
  threedpayload: string;
  transactionreference: string;
  threedresponse?: string;
  cachetoken?: string;
  requesttypescription: string;
  threedversion: string;
}
