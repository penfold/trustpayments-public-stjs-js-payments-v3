import { BrowserOptions } from '@sentry/browser';
import { environment } from '../../../../environments/environment';

export const SENTRY_INIT_BROWSER_OPTIONS : Partial<BrowserOptions> = {
  sampleRate: environment.SENTRY.SAMPLE_RATE,
  attachStacktrace: true,
  normalizeDepth: 4,
}
