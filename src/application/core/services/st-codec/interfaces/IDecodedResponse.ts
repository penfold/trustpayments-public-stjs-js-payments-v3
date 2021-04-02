import { IRequestTypeResponse } from './IRequestTypeResponse';

export interface IDecodedResponse {
  responseJwt: string;
  updatedMerchantJwt?: string;
  customerOutput: IRequestTypeResponse;
}
