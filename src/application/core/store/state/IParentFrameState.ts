import { IConfig } from '../../../../shared/model/config/IConfig';

export interface IParentFrameState {
  config?: IConfig;
  storage: { [key: string]: unknown };
  applePay?: { [key: string]: unknown };
}
