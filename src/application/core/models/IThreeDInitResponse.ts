import { ThreeDVerificationProviderName } from '../services/three-d-verification/data/ThreeDVerificationProviderName';

export interface IThreeDInitResponse {
  errorcode: string;
  errormessage: string;
  requesttypedescription: string;
  transactionstartedtimestamp: string;
  threedsprovider: ThreeDVerificationProviderName;
  cachetoken?: string;
  threedinit?: string;
  maskedpan?: string;
}
