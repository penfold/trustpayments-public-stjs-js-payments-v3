import { SentryBreadcrumbsCategories } from '../../../../shared/services/sentry/SentryBreadcrumbsCategories';

export interface SentryBreadcrumbsSenderConfig {
  message: (name?:string) => string,
  sentryBreadcrumbsCategories: SentryBreadcrumbsCategories,
}

export interface SentryBreadcrumbsMessageBusData {
  name?: string;
  customMessage?: string;
  newJwt?: string;
}
