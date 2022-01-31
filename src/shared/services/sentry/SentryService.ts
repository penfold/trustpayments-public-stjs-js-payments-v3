import { Service } from 'typedi';
import { Event, EventHint } from '@sentry/types';
import { firstValueFrom, Observable, OperatorFunction, Subscription, throwError, timeout } from 'rxjs';
import { Breadcrumb, BreadcrumbHint, BrowserOptions } from '@sentry/browser';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { environment } from '../../../environments/environment';
import { JwtProvider } from '../jwt-provider/JwtProvider';
import { SentryContext } from './SentryContext';
import { EventScrubber } from './EventScrubber';
import { Sentry } from './Sentry';
import { RequestTimeoutError } from './RequestTimeoutError';
import { PayloadSanitizer } from './PayloadSanitizer';
import { SENTRY_INIT_BROWSER_OPTIONS } from './constants/SentryBrowserOptions';

@Service()
export class SentryService {
  private configSubscription: Subscription;

  constructor(
    private configProvider: ConfigProvider,
    private sentry: Sentry,
    private sentryContext: SentryContext,
    private eventScrubber: EventScrubber,
    private jwtProvider: JwtProvider,
    private payloadSanitizer: PayloadSanitizer,
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
      .subscribe(config => {
        this.sentry.setExtra('config', config);
        this.sentry.setExtra('jwt', this.payloadSanitizer.maskSensitiveJwtFields(config.jwt));
      });

    this.jwtProvider.getJwtPayload().subscribe(jwtPayload => {
        this.sentry.setUser({ 'id': jwtPayload?.sitereference });
      }
    );
  }

  private initSentry(dsn: string, whitelistUrls: string[]): void {
    this.sentry.setTag('hostName', this.sentryContext.getHostName());
    this.sentry.setTag('frameName', this.sentryContext.getFrameName());

    const options: BrowserOptions = {
      dsn,
      ...SENTRY_INIT_BROWSER_OPTIONS,
      release: this.sentryContext.getReleaseVersion(),
      beforeSend: (event: Event, hint?: EventHint) => this.beforeSend(event, hint),
      beforeBreadcrumb: (breadcrumb: Breadcrumb, hint?: BreadcrumbHint): Breadcrumb | null => this.beforeBreadcrumb(breadcrumb, hint),
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

  private beforeBreadcrumb(breadcrumb: Breadcrumb, hint?: BreadcrumbHint): Breadcrumb | null {
    return breadcrumb.category === 'console' && (breadcrumb.level === 'info' || breadcrumb.level === 'log') ? null : breadcrumb;
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
