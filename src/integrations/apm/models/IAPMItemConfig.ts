import { APMName } from './APMName';

export interface IAPMItemConfig {
  button?: {
    backgroundColor?: string;
    height?: string;
    text?: string;
    textColor?: string;
    width?: string;
  };
  maxBaseAmount?: number;
  minBaseAmount?: number;
  name: APMName;
  placement?: string;
}
