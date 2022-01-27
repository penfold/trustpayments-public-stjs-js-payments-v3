import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { ValidationResult } from 'joi';
import { IAPMConfig } from '../../models/IAPMConfig';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { APMValidator } from '../apm-validator/APMValidator';
import { APMConfigError } from '../../models/errors/APMConfigError';

@Service()
export class APMConfigResolver {
  constructor(private apmValidator: APMValidator) {}

  resolve(config: IAPMConfig): Observable<IAPMConfig> {
    const result: ValidationResult = this.apmValidator.validateConfig(config);

    if (result.error) {
      throw new APMConfigError([result.error]);
    }

    return of(this.resolveConfig(config));
  }

  private resolveConfig(config: IAPMConfig): IAPMConfig {
    const resolvedApmList = config.apmList.map((item: IAPMItemConfig | APMName) => {
      if (this.isAPMItemConfig(item)) {
        const resolved = {
          ...item,
          placement: item.placement || config.placement,
          errorRedirectUrl: item.errorRedirectUrl || config.errorRedirectUrl,
          successRedirectUrl: item.successRedirectUrl || config.successRedirectUrl,
          cancelRedirectUrl: item.cancelRedirectUrl || config.cancelRedirectUrl,
        };

        if (item.name === APMName.ACCOUNT2ACCOUNT) {
          resolved.button = {
            width: item.button?.width || '80px',
            height: item.button?.height || '65px',
            backgroundColor: item.button?.backgroundColor || '#389c74',
            textColor: item.button?.textColor || '#fff',
            text: item.button?.text || 'Pay by Bank',
          };
        }

        return resolved;
      }

      const resolved: IAPMItemConfig = {
        name: item,
        placement: config.placement,
        errorRedirectUrl: config.errorRedirectUrl,
        successRedirectUrl: config.successRedirectUrl,
        cancelRedirectUrl: config.cancelRedirectUrl,
      };

      if (item === APMName.ACCOUNT2ACCOUNT) {
        resolved.button = {
          width: '80px',
          height: '65px',
          backgroundColor: '#389c74',
          textColor: '#fff',
          text: 'Pay by Bank',
        };
      }

      return resolved;

    });
    return { ...config, apmList: resolvedApmList };
  }

  private isAPMItemConfig(configOrName: IAPMItemConfig | APMName): configOrName is IAPMItemConfig {
    return typeof configOrName !== 'string';
  }
}
