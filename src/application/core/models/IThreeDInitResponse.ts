import { IRequestTypeResponse } from '../services/st-codec/interfaces/IRequestTypeResponse';

export interface IThreeDInitResponse extends IRequestTypeResponse {
  cachetoken: string;
  threedinit: string;
  maskedpan?: string;
  jwt: string;
}
