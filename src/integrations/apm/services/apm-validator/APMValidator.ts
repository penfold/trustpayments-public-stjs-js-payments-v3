import { Service } from 'typedi';
import { ValidationError, ValidationResult } from 'joi';
import { APMSchema, APMSchemasMap } from '../../models/APMSchema';
import { IAPMConfig } from '../../models/IAPMConfig';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMJwtSchemasMap } from '../../models/APMJwtSchemasMap';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { MisconfigurationError } from '../../../../shared/services/sentry/errors/MisconfigurationError';

@Service()
export class APMValidator {
  constructor(private sentryService: SentryService) {
  }

  validateConfig(config: IAPMConfig): ValidationResult {
    const validationResult = APMSchema.validate(config);
    this.handleApmDeprecatedFields(validationResult);

    return validationResult;
  }

  validateItemConfig(apm: IAPMItemConfig): ValidationError | null {
    if (!APMSchemasMap.has(apm.name)) {
      return null;
    }

    const validationResult: ValidationResult = APMSchemasMap.get(apm.name).validate(apm);
    this.handleApmDeprecatedFields(validationResult);

    return validationResult.error || null;
  }

  validateJwt(apm: IAPMItemConfig, jwtPayload: IStJwtPayload): ValidationError | null {
    if (!APMJwtSchemasMap.has(apm.name)) {
      return null;
    }

    return APMJwtSchemasMap.get(apm.name).validate(jwtPayload).error || null;
  }

  private handleApmDeprecatedFields(validationResult: ValidationResult) {
    if (validationResult.warning) {
      console.warn(validationResult.warning.message);
      this.sentryService.sendCustomMessage(new MisconfigurationError(`Misconfiguration: ${validationResult.warning.message}`, validationResult.warning));
    }
  }
}
