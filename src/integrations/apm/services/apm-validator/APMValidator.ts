import { Service } from 'typedi';
import { ValidationError, ValidationResult } from 'joi';
import { APMSchema, APMSchemasMap } from '../../models/APMSchema';
import { IAPMConfig } from '../../models/IAPMConfig';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMJwtSchemasMap } from '../../models/APMJwtSchemasMap';

@Service()
export class APMValidator {
  constructor() {
  }

  validateConfig(config: IAPMConfig): ValidationResult {
    return APMSchema.validate(config);
  }

  validateItemConfig(apm: IAPMItemConfig): ValidationError | null {
    if (!APMSchemasMap.has(apm.name)) {
      return null;
    }

    const validationResult: ValidationResult = APMSchemasMap.get(apm.name).validate(apm);

    return validationResult.error || null;
  }

  validateJwt(apm: IAPMItemConfig, jwtPayload: IStJwtPayload): ValidationError | null {
    if (!APMJwtSchemasMap.has(apm.name)) {
      return null;
    }

    return APMJwtSchemasMap.get(apm.name).validate(jwtPayload).error || null;
  }
}
