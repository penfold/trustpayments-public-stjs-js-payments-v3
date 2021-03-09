import { IConfig } from '../../../../shared/model/config/IConfig';

export interface IParentFrameState {
  config?: IConfig;
  storage: { [key: string]: any };
  applePay?: { [key: string]: any };
}
