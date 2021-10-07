import { Service } from 'typedi';
import { init, setTag, setExtra, BrowserOptions, captureException } from '@sentry/browser';

@Service()
export class Sentry {
  init(options?: BrowserOptions): void {
    init(options);
  }

  setTag(key: string, value: string): void {
    setTag(key, value);
  }

  setExtra(key: string, extra: unknown): void {
    setExtra(key, extra);
  }

  captureException(err: Error): void {
    captureException(err);
  }
}
