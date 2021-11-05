import { CardType } from '@trustpayments/3ds-sdk-js';
import { IResponseData } from './IResponseData';
import { Enrollment } from './constants/Enrollment';

export interface IThreeDQueryResponse extends IResponseData {
  jwt: string;
  acquirertransactionreference: string;
  acquirerresponsecode: string;
  acquirerresponsemessage: string;
  acsurl: string;
  enrolled: Enrollment | string;
  threedpayload?: string;
  pareq?: string;
  pares?: string;
  md?: string;
  transactionreference: string;
  threedresponse?: string;
  cachetoken?: string;
  requesttypedescription: string;
  threedversion: string;
  paymenttypedescription: CardType;
}
