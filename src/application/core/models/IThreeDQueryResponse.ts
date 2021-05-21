import { IResponseData } from './IResponseData';
import { Enrollment } from './constants/Enrollment';

export interface IThreeDQueryResponse extends IResponseData {
  jwt: string;
  acquirertransactionreference: string;
  acquirerresponsecode: string;
  acquirerresponsemessage: string;
  acsurl: string;
  enrolled: Enrollment | string;
  threedpayload: string;
  transactionreference: string;
  threedresponse?: string;
  cachetoken?: string;
  requesttypescription: string;
  threedversion: string;
}
