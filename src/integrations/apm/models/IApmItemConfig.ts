import { IApmName } from './IApmName';

export interface IApmItemConfig {
  name: IApmName;
  successRedirectUrl?: string;
  errorRedirectUrl?: string;
  cancelRedirectUrl?: string;
}
