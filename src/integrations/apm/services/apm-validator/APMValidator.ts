import { Service } from 'typedi';
import { ValidationResult } from 'joi';
import { APMSchema } from '../../models/APMSchema';
import { IAPMConfig } from '../../models/IAPMConfig';

@Service()
export class APMValidator {
  validate(config: IAPMConfig): ValidationResult {
    return APMSchema.validate(config);
  }
}
