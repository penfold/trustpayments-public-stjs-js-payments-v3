import { ThreeDVerificationProvider } from '../services/three-d-verification/ThreeDVerificationProvider';

export interface IThreeDInitResponse {
  errorcode: string;
  errormessage: string;
  requesttypedescription: string;
  transactionstartedtimestamp: string;
  threedsprovider: ThreeDVerificationProvider;
  cachetoken?: string;
  threedinit?: string;
  maskedpan?: string;
}
