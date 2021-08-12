import { RequestType } from '../../../shared/types/RequestType';

export interface IRequestData {
  requestid: string;
  sitereference: string;
  [key: string]: string | string[] | RequestType[];
}

export interface IRequestObject {
  acceptcustomeroutput: string;
  jwt: string;
  request: IRequestData[];
  version: string;
  versioninfo: string;
}
