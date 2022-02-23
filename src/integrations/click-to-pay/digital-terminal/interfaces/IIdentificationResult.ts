import { IdentificationFailureReason } from '../IdentificationFailureReason';

export interface IIdentificationResult {
  isSuccessful: boolean;
  failureReason?: IdentificationFailureReason;
}
