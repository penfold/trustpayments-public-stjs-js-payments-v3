import { APMSchema, APMSchemasMap } from '../../models/APMSchema';
import { IAPMConfig } from '../../models/IAPMConfig';
import { Service } from 'typedi';
import { ValidationError, ValidationResult } from 'joi';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
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
    const jwtPayload = this.jwtDecoder.decode<IStJwtPayload>(this.configProvider.getConfig().jwt).payload;

    apmList.forEach((apm: IAPMItemConfig) => {
      validationErrors.push(...[
        this.validateConfig(apm),
        this.validateJwt(apm.name, jwtPayload),
      ].filter(Boolean));
    });

    return validationErrors;
  }

  private validateConfig(apm: IAPMItemConfig): ValidationError | null {
    if (!APMSchemasMap.has(apm.name)) {
      return null;
    }

    const validationResult: ValidationResult = APMSchemasMap.get(apm.name).validate(apm);

    return validationResult.error || null;
  }

  private validateJwt(apmName: APMName, jwtPayload: IStJwtPayload): ValidationError | null {
    if (!AMPJwtSchemasMap.has(apmName)) {
      return null;
    }

    const validationResult: ValidationResult = AMPJwtSchemasMap.get(apmName).validate(jwtPayload);

    return validationResult.error || null;
  }
}
