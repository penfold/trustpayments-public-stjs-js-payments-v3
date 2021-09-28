import { IAPMName } from './IAPMName';

export interface IAPMItemConfig {
  name: IAPMName;
  successRedirectUrl?: string;
  errorRedirectUrl?: string;
  cancelRedirectUrl?: string;
}
