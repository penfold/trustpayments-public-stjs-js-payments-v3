import { IConfig } from '../../../shared/model/config/IConfig';

export interface IStJwtPayload {
  config?: IConfig | undefined;
  [key: string]: any;
}
