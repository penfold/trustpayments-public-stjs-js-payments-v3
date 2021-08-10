import { ActionCode } from './ActionCode';

export interface IVerificationResult {
  actionCode: ActionCode;
  errorNumber: number;
  errorDescription: string;
  validated?: boolean;
  jwt?: string;
}
