import { IResponseData } from './IResponseData';

export interface IThreeDQueryResponse extends IResponseData {
  acquirertransactionreference: string;
  acsurl: string;
  enrolled: string;
  threedpayload: string;
  transactionreference: string;
  threedresponse?: string;
  cachetoken?: string;
}
