import { APMName } from './APMName';

export interface IAPMItemConfig {
  button?: {
    backgroundColor?: string;
    height?: string;
    text?: string;
    textColor?: string;
    width?: string;
  };
  cancelRedirectUrl?: string;
  errorRedirectUrl?: string;
  maxBaseAmount?: number;
  minBaseAmount?: number;
  name: APMName;
  placement?: string;
  returnUrl?: string;
  successRedirectUrl?: string;
}
