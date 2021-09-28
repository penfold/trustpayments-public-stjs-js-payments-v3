import { IApmName } from './IApmName';

export const ApmConfigName = 'apm';

export interface IApmConfig {
  placement: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  cancelRedirectUrl: string;
  apmList: Array<IApmName | IApmConfig>;
}
