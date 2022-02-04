import { Container, Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { ValidationResult } from 'joi';
import { IAPMConfig } from '../../models/IAPMConfig';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { APMValidator } from '../apm-validator/APMValidator';
import { APMConfigError } from '../../models/errors/APMConfigError';
import { APMA2AButtonConfig } from '../../models/APMA2AButtonConfig';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';

@Service()
export class APMConfigResolver {

  private translator: ITranslator;

  constructor(
    private apmValidator: APMValidator
  ) {
    this.translator = Container.get(TranslatorToken);
  }

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
            width: item.button?.width || APMA2AButtonConfig.width,
            height: item.button?.height || APMA2AButtonConfig.height,
            backgroundColor: item.button?.backgroundColor || APMA2AButtonConfig.backgroundColor,
            textColor: item.button?.textColor || APMA2AButtonConfig.textColor,
            text: this.translator.translate(item.button?.text || APMA2AButtonConfig.text),
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
        resolved.button = APMA2AButtonConfig;
        resolved.button.text = this.translator.translate(resolved.button.text);
      }

      return resolved;

    });
    return { ...config, apmList: resolvedApmList };
  }

  private isAPMItemConfig(configOrName: IAPMItemConfig | APMName): configOrName is IAPMItemConfig {
    return typeof configOrName !== 'string';
  }
}
