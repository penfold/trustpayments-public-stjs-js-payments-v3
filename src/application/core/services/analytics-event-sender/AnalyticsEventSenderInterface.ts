import { GAEventType } from '../../integrations/google-analytics/events';

export interface AnalyticsEventSenderConfig {
  gaEventType: GAEventType,
  message: (name?:string) => string,
}
