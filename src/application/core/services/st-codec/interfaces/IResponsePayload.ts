import { IRequestTypeResponse } from './IRequestTypeResponse';

export interface IResponsePayload {
  requestreference: string;
  response: IRequestTypeResponse[];
  secrand: string;
  version: string;
  jwt?: string;
}
