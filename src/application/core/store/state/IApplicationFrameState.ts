import { IConfig } from '../../../../shared/model/config/IConfig';

export interface IApplicationFrameState {
  config?: IConfig;
  storage: { [key: string]: any };
  applePay?: { [key: string]: any };
  jwt?: string;
  originalJwt?: string;
}
