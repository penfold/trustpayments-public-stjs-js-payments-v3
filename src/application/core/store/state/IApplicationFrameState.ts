import { IConfig } from '../../../../shared/model/config/IConfig';

export interface IApplicationFrameState {
  config?: IConfig;
  storage: { [key: string]: unknown };
  applePay?: { [key: string]: unknown };
  jwt?: string;
  originalJwt?: string;
}
