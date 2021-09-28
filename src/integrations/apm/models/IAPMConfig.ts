import { APMName } from './APMName';
import { IAPMItemConfig } from './IAPMItemConfig';

export const APMConfigName = 'APM';

export interface IAPMConfig {
  placement: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  cancelRedirectUrl: string;
  apmList: Array<APMName | IAPMItemConfig>;
}
