import { BrowserOptions } from '@sentry/browser';
import { ExceptionsToSkip } from '../ExceptionsToSkip';
import { environment } from '../../../../environments/environment';

export const SENTRY_INIT_BROWSER_OPTIONS : Partial<BrowserOptions> = {
  ignoreErrors: ExceptionsToSkip,
  sampleRate: environment.SENTRY.SAMPLE_RATE,
  attachStacktrace: true,
  normalizeDepth: 4,
}
