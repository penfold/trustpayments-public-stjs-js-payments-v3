import { IAPMConfig } from './IAPMConfig';
import { IAPMItemConfig } from './IAPMItemConfig';
import { APMName } from './APMName';

// TODO verify which properties should be taken from default
export const getAPMListFromConfig = (config: IAPMConfig): IAPMItemConfig[] => {
  return config.apmList.map((item: IAPMItemConfig | APMName) => {
    let normalizedItemConfig: IAPMItemConfig;

    if (isAPMItemConfig(item)) {
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
};

export const isAPMItemConfig = (configOrName: IAPMItemConfig | APMName): configOrName is IAPMItemConfig => {
  return typeof configOrName !== 'string';
};
