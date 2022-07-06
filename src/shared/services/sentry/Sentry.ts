import { Service } from 'typedi';
import { BrowserOptions, User } from '@sentry/browser';
import { Breadcrumb } from '@sentry/types';

@Service()
export class Sentry {
  init(options?: BrowserOptions): void {
    // TODO disabled due to https://securetrading.atlassian.net/browse/STJS-3609
    // commented to prevent global __SENTRY__ object creation
    // init(options);
  }

  setTag(key: string, value: string): void {
    // TODO disabled due to https://securetrading.atlassian.net/browse/STJS-3609
    // commented to prevent global __SENTRY__ object creation
    //setTag(key, value);
  }

  setExtra(key: string, extra: unknown): void {
    // TODO disabled due to https://securetrading.atlassian.net/browse/STJS-3609
    // commented to prevent global __SENTRY__ object creation
    //setExtra(key, extra);
  }

  captureException(err: Error): void {
    // TODO disabled due to https://securetrading.atlassian.net/browse/STJS-3609
    // commented to prevent global __SENTRY__ object creation
    //captureException(err);
  }

  setUser(user: User): void {
    // TODO disabled due to https://securetrading.atlassian.net/browse/STJS-3609
    // commented to prevent global __SENTRY__ object creation
    //setUser(user);
  }

  addBreadcrumb(breadcrumb:Breadcrumb) {
    // TODO disabled due to https://securetrading.atlassian.net/browse/STJS-3609
    // commented to prevent global __SENTRY__ object creation
    //addBreadcrumb(breadcrumb)
  }
}
