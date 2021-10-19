import { APMSchema, APMSchemasMap } from '../../models/APMSchema';
import { IAPMConfig } from '../../models/IAPMConfig';
import { Service } from 'typedi';
import { ValidationError, ValidationResult } from 'joi';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';

@Service()
export class APMValidator {

  constructor() {
  }

  validate(config: IAPMConfig): ValidationResult {
    return APMSchema.validate(config);
  }

  validateAPMItemConfigs(apmList: Array<IAPMItemConfig>): ValidationError[] {
    const validationErrors: ValidationError[] = [];

    apmList.forEach((apm: IAPMItemConfig) => {
      if (!APMSchemasMap.has(apm.name)) {
        return;
      }

      const validationResult: ValidationResult = APMSchemasMap.get(apm.name).validate(apm);
      if (validationResult.error) {
        validationErrors.push(validationResult.error);
      }
    });

    return validationErrors;
  }
}
