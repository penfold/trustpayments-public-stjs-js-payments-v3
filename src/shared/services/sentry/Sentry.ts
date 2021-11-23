import { Service } from 'typedi';
import * as SentryBrowser from '@sentry/browser';

@Service()
export class Sentry {
  init(options?: SentryBrowser.BrowserOptions): void {
    SentryBrowser.init(options);
  }

  setTag(key: string, value: string): void {
    SentryBrowser.setTag(key, value);
  }

  setExtra(key: string, extra: unknown): void {
    SentryBrowser.setExtra(key, extra);
  }

  captureException(err: Error): void {
    SentryBrowser.captureException(err);
  }
}
