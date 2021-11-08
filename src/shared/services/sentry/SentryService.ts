import { ConfigProvider } from '../config-provider/ConfigProvider';
import { Service } from 'typedi';
import { SentryContext } from './SentryContext';
import { Event, EventHint } from '@sentry/types';
import { EventScrubber } from './EventScrubber';
import { Sentry } from './Sentry';
import { firstValueFrom, Subscription } from 'rxjs';
import { ExceptionsToSkip } from './ExceptionsToSkip';
import { BrowserOptions } from '@sentry/browser';
import { environment } from '../../../environments/environment.rc';

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
