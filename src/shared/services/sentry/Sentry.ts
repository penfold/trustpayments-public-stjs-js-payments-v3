import { Service } from 'typedi';
import { User, init, setTag, setExtra, captureException, setUser, BrowserOptions, addBreadcrumb } from '@sentry/browser';
import { Breadcrumb } from '@sentry/types';

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

  setUser(user: User): void {
    setUser(user);
  }

  addBreadcrumb(breadcrumb:Breadcrumb) {
    addBreadcrumb(breadcrumb)
  }
}
