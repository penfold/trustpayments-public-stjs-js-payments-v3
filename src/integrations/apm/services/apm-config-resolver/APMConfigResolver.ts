import { Service } from 'typedi';
import { IAPMConfig } from '../../models/IAPMConfig';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';

@Service()
export class APMConfigResolver {

  constructor() {}

  resolve(config: IAPMConfig): IAPMConfig {
    const resolvedApmList = config.apmList.map((item: IAPMItemConfig | APMName) => {
      let normalizedItemConfig: IAPMItemConfig;

      if (this.isAPMItemConfig(item)) {
        normalizedItemConfig = {
          name: item.name,
          errorRedirectUrl: item.errorRedirectUrl || config.errorRedirectUrl,
          successRedirectUrl: item.successRedirectUrl || config.successRedirectUrl,
          cancelRedirectUrl: item.cancelRedirectUrl || config.cancelRedirectUrl,
          placement: item.placement || config.placement,
        };
      } else {
        normalizedItemConfig = {
          name: item,
          errorRedirectUrl: config.errorRedirectUrl,
          successRedirectUrl: config.successRedirectUrl,
          cancelRedirectUrl: config.cancelRedirectUrl,
          placement: config.placement,
        };
      }

      return normalizedItemConfig;
    });
    return { ...config, apmList: resolvedApmList };
  }

  private isAPMItemConfig(configOrName: IAPMItemConfig | APMName): configOrName is IAPMItemConfig {
    return typeof configOrName !== 'string';
  }
}
