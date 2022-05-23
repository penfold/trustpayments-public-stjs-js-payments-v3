import { Service } from 'typedi';
import { User, init, setTag, setExtra, captureException, setUser, BrowserOptions, BrowserClient, addBreadcrumb, configureScope, makeMain } from '@sentry/browser';
import { Breadcrumb } from '@sentry/types';
import { Scope , Hub } from '@sentry/hub';

@Service()
export class Sentry {
  init(options?: BrowserOptions): void {
    init(options);
  }

  makeMain(hub): Hub {
    return makeMain(hub);
  }

  newHub(options?: BrowserOptions): Hub {
    const client: BrowserClient = new BrowserClient(options)
    return new Hub(client)
  }

  configureScope(callback: (scope: Scope) => void): void {
    configureScope(callback);
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
