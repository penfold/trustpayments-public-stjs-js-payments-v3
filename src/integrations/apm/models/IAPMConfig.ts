import { APMName } from './APMName';
import { IAPMItemConfig } from './IAPMItemConfig';

export interface IAPMConfig {
  placement: string;
  apmList: Array<APMName | IAPMItemConfig>;
}
