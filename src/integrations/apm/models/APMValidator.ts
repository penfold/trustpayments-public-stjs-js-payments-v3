import { Service } from 'typedi';
import { ValidationResult } from 'joi';
import { APMSchema } from './APMSchema';
import { IAPMConfig } from './IAPMConfig';

@Service()
export class APMValidator {
  validate(config: IAPMConfig): ValidationResult {
    return APMSchema.validate(config);
  }
}
