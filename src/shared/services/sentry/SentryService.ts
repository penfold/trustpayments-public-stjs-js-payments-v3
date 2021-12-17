import { Service } from 'typedi';
import { Event, EventHint } from '@sentry/types';
import { firstValueFrom, Observable, OperatorFunction, Subscription, throwError, timeout } from 'rxjs';
import { BrowserOptions } from '@sentry/browser';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { environment } from '../../../environments/environment';
import { SentryContext } from './SentryContext';
import { EventScrubber } from './EventScrubber';
import { Sentry } from './Sentry';
import { ExceptionsToSkip } from './ExceptionsToSkip';
import { RequestTimeoutError } from './RequestTimeoutError';

@Service()
export class SentryService {
  private configSubscription: Subscription;

  constructor(
    private configProvider: ConfigProvider,
    private sentry: Sentry,
    private sentryContext: SentryContext,
    private eventScrubber: EventScrubber
  ) {
  }

  init(dsn: string | null, whitelistUrls: string[] = []): void {
    if (!dsn) {
      return;
    }

    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }

    this.initSentry(dsn, whitelistUrls);

    this.configSubscription = this.configProvider.getConfig$(true)
      .subscribe(config => this.sentry.setExtra('config', config));
  }

  private initSentry(dsn: string, whitelistUrls: string[]): void {
    this.sentry.setTag('hostName', this.sentryContext.getHostName());
    this.sentry.setTag('frameName', this.sentryContext.getFrameName());

    const options: BrowserOptions = {
      dsn,
      release: this.sentryContext.getReleaseVersion(),
      ignoreErrors: ExceptionsToSkip,
      sampleRate: environment.SENTRY.SAMPLE_RATE,
      attachStacktrace: true,
      normalizeDepth: 3,
      beforeSend: (event: Event, hint?: EventHint) => this.beforeSend(event, hint),
    };

    if (whitelistUrls.length) {
      options.allowUrls = whitelistUrls;
    }

    this.sentry.init(options);
  }

  sendCustomMessage(err: Error): void {
    this.sentry.captureException(err);
  }

  captureAndReportResourceLoadingTimeout(errorMessage: string, scriptLoadTimeout = environment.SCRIPT_LOAD_TIMEOUT): OperatorFunction<any, any> {
    return (source: Observable<any>) => source
      .pipe(
        timeout({
          each: scriptLoadTimeout,
          with: () => {
            const error = new RequestTimeoutError(errorMessage);
            this.sendCustomMessage(error);
            return throwError(() => error);
          },
        })
      );
  }

  private beforeSend(event: Event, hint?: EventHint): Promise<Event | null> {
    return firstValueFrom(this.configProvider.getConfig$(false)).then(config => {
      if (!config.errorReporting) {
        return null;
      }

      event.environment = config.livestatus ? 'prod' : 'dev';

      return this.eventScrubber.scrub(event, hint);
    });
  }
}
