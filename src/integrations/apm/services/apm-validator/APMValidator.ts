import { APMSchema, APMSchemasMap } from '../../models/APMSchema';
import { IAPMConfig } from '../../models/IAPMConfig';
import { Service } from 'typedi';
import * as Joi from 'joi';
import { ObjectSchema, ValidationError, ValidationResult } from 'joi';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { AMPJwtSchemasMap } from '../../models/APMJwtSchemasMap';

@Service()
export class APMValidator {
  constructor(
    private jwtDecoder: JwtDecoder,
    private configProvider: ConfigProvider,
  ) {
  }

  validate(config: IAPMConfig): ValidationResult {
    return APMSchema.validate(config);
  }

  validateAPMItemConfigs(apmList: Array<IAPMItemConfig>): ValidationError[] {
    const validationErrors: ValidationError[] = [];
    const jwtValidationError: ValidationError | null = this.validateJwt(apmList);

    apmList.forEach((apm: IAPMItemConfig) => {
      validationErrors.push(...[
        this.validateConfig(apm),
      ].filter(Boolean));
    });

    if (jwtValidationError) {
      validationErrors.push(jwtValidationError);
    }

    return validationErrors;
  }

  private validateJwt(apmList: Array<IAPMItemConfig>): ValidationError | null {
    const jwtPayload = this.jwtDecoder.decode<IStJwtPayload>(this.configProvider.getConfig().jwt).payload;
    const concatSchema: ObjectSchema = apmList.reduce((schema, apmConfig) => {
      if (!AMPJwtSchemasMap.has(apmConfig.name)) {
        return schema;
      }

      return schema.concat(AMPJwtSchemasMap.get(apmConfig.name));
    }, Joi.object());

    return concatSchema.validate(jwtPayload).error || null;
  }

  private validateConfig(apm: IAPMItemConfig): ValidationError | null {
    if (!APMSchemasMap.has(apm.name)) {
      return null;
    }

    const validationResult: ValidationResult = APMSchemasMap.get(apm.name).validate(apm);

    return validationResult.error || null;
  }
}
