import { APMName } from './APMName';

export interface IAPMItemConfig {
  name: APMName;
  successRedirectUrl?: string;
  errorRedirectUrl?: string;
  cancelRedirectUrl?: string;
}
