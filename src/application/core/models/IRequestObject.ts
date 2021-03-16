interface IRequestData {
  requestid: string;
  sitereference: string;
  [key: string]: any;
}

export interface IRequestObject {
  acceptcustomeroutput: string;
  jwt: string;
  request: IRequestData[];
  version: string;
  versioninfo: string;
}
