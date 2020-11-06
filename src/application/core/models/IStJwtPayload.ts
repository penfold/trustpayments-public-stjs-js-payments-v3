import { IConfig } from '../../../shared/model/config/IConfig';
import { RequestType } from '../../../shared/types/RequestType';

export interface IStJwtPayload {
  config?: IConfig;
  requesttypedescriptions?: RequestType[];
  [key: string]: any;
}
