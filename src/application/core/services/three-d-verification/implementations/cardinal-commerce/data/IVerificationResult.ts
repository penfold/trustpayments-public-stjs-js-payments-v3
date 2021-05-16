import { ActionCode } from './ActionCode';

export interface IVerificationResult {
  validated: boolean;
  actionCode: ActionCode;
  errorNumber: number;
  errorDescription: string;
  jwt?: string;
}
