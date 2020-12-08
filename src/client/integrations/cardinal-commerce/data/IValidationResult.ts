import { ActionCode } from '../../../../application/core/services/three-d-verification/data/ActionCode';

export interface IValidationResult {
  Validated: boolean;
  ActionCode: ActionCode;
  ErrorNumber: number;
  ErrorDescription: string;
  jwt?: string;
}
