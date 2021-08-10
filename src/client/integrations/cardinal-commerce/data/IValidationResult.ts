import { ActionCode } from '../../../../application/core/services/three-d-verification/implementations/cardinal-commerce/data/ActionCode';

export interface IValidationResult {
  Validated: boolean;
  ActionCode: ActionCode;
  ErrorNumber: number;
  ErrorDescription: string;
  jwt?: string;
}
