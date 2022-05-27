import { IConfig } from '../../../../shared/model/config/IConfig';
import { ISentryData } from '../../../../shared/services/sentry/models/ISentryData';

export interface IParentFrameState {
  config?: IConfig;
  storage: { [key: string]: unknown };
  applePay?: { [key: string]: unknown };
  sentryData?: ISentryData
}
