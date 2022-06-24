import { BrowserOptions } from '@sentry/browser';
import { environment } from '../../../../environments/environment';
import { SENTRY_EXCEPTION_MESSAGE_LIST } from '../SentryEventFiltering/SentryEventFilteringConfig';

export const SENTRY_INIT_BROWSER_OPTIONS : Partial<BrowserOptions> = {
  sampleRate: environment.SENTRY.SAMPLE_RATE,
  attachStacktrace: true,
  ignoreErrors: SENTRY_EXCEPTION_MESSAGE_LIST,
  normalizeDepth: 4,
}
