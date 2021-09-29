import { IAPMConfig } from './IAPMConfig';
import { IAPMItemConfig } from './IAPMItemConfig';
import { APMName } from './APMName';

// TODO verify which properties should be taken from default
export const getAPMListFromConfig = (config: IAPMConfig): IAPMItemConfig[] => {
  return config.apmList.map((item: IAPMItemConfig | APMName) => {
    if (isAPMItemConfig(item)) {
      return item;
    } else {
      return {
        name: item,
        errorRedirectUrl: config.errorRedirectUrl,
        successRedirectUrl: config.successRedirectUrl,
        cancelRedirectUrl: config.cancelRedirectUrl,
      };
    }
  });
};

export const isAPMItemConfig = (configOrName: IAPMItemConfig | APMName): configOrName is IAPMItemConfig => {
  return typeof configOrName !== 'string';
};
