import { IRequestTypeResponse } from './IRequestTypeResponse';

export interface IDecodedResponse {
  customerOutput: IRequestTypeResponse;
  requestreference: string;
  responseJwt: string;
  updatedMerchantJwt?: string;
}
