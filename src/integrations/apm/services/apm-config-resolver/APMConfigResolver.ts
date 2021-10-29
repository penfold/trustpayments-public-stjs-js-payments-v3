import { Service } from 'typedi';
import { ValidationError, ValidationResult } from 'joi';
import { IAPMConfig } from '../../models/IAPMConfig';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { APMValidator } from '../apm-validator/APMValidator';
import { APMConfigError } from '../../models/errors/APMConfigError';

@Service()
export class APMConfigResolver {

  constructor(
    private apmValidator: APMValidator
  ) {
  }

  resolve(config: IAPMConfig): IAPMConfig {
    const result: ValidationResult = this.apmValidator.validate(config);

    if (result.error) {
      throw new APMConfigError([result.error]);
    }
    const normalizedConfig: IAPMConfig = this.resolveConfig(config);
    const validationErrors: ValidationError[] = this.apmValidator.validateAPMItemConfigs(normalizedConfig.apmList as IAPMItemConfig[]);

    if (validationErrors.length) {
      throw new APMConfigError(validationErrors);
    }

    return normalizedConfig;
  }

  private resolveConfig(config: IAPMConfig): IAPMConfig {
    const resolvedApmList = config.apmList.map((item: IAPMItemConfig | APMName) => {

      if (this.isAPMItemConfig(item)) {
        return {
          ...item,
          placement: item.placement || config.placement,
          errorRedirectUrl: item.errorRedirectUrl || config.errorRedirectUrl,
          successRedirectUrl: item.successRedirectUrl || config.successRedirectUrl,
          cancelRedirectUrl: item.cancelRedirectUrl || config.cancelRedirectUrl,
        };
      }

      return {
        name: item,
        placement: config.placement,
        errorRedirectUrl: config.errorRedirectUrl,
        successRedirectUrl: config.successRedirectUrl,
        cancelRedirectUrl: config.cancelRedirectUrl,
      };
    });
    return { ...config, apmList: resolvedApmList };
  }

  private isAPMItemConfig(configOrName: IAPMItemConfig | APMName): configOrName is IAPMItemConfig {
    return typeof configOrName !== 'string';
  }
}
