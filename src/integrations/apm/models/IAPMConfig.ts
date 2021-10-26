import { APMName } from './APMName';
import { IAPMItemConfig } from './IAPMItemConfig';

export interface IAPMConfig {
  placement: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  cancelRedirectUrl?: string;
  returnUrl?: string;
  apmList: Array<APMName | IAPMItemConfig>;
}
