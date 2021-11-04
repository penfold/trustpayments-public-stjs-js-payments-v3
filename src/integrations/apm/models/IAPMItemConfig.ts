import { APMName } from './APMName';

export interface IAPMItemConfig {
  name: APMName;
  placement?: string;
  successRedirectUrl?: string;
  errorRedirectUrl?: string;
  cancelRedirectUrl?: string;
  returnUrl?: string;
  minBaseAmount?: number;
  maxBaseAmount?: number;
}
