import { IRequestTypeResponse } from '../services/st-codec/interfaces/IRequestTypeResponse';
import { ThreeDVerificationProviderName } from '../services/three-d-verification/data/ThreeDVerificationProviderName';

export interface IThreeDInitResponse extends IRequestTypeResponse {
  cachetoken?: string;
  threedinit?: string;
  maskedpan?: string;
  threedsprovider: ThreeDVerificationProviderName;
  jwt: string;
}
