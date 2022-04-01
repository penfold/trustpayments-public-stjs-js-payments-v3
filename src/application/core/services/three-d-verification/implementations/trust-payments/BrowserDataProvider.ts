import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { BrowserDataInterface } from '@trustpayments/3ds-sdk-js';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { environment } from '../../../../../../environments/environment';
import { RequestTimeoutError } from '../../../../../../shared/services/sentry/RequestTimeoutError';
import { SentryService } from '../../../../../../shared/services/sentry/SentryService';
import { TimeoutDetailsType } from '../../../../../../shared/services/sentry/RequestTimeout';
import { IMessageBus } from '../../../../shared/message-bus/IMessageBus';
import { ofType } from '../../../../../../shared/services/message-bus/operators/ofType';
import { SentryBreadcrumbsCategories } from '../../../../../../shared/services/sentry/SentryBreadcrumbsCategories';
import { IBrowserData } from './data/IBrowserData';

@Service()
export class BrowserDataProvider {
  private readonly browserData3dsServerUrl = environment.BROWSER_DATA_URLS;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private sentryService: SentryService,
    private messageBus: IMessageBus
  ) {
    this.listenToLogs();
  }

  getBrowserData$(): Observable<IBrowserData> {
    const urls = this.extendUrlsWithRandomNumbers();

    const queryEvent: IMessageBusEvent<string[]> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA,
      data: urls,
    };

    return from(this.interFrameCommunicator.query<BrowserDataInterface>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
      tap((browserData: BrowserDataInterface) => {
        if (!browserData.browserIP) {
          this.sendErrorMessage(queryEvent.data);
        }
      }),
      map((browserData: BrowserDataInterface) => ({
        browsercolordepth: this.stringify(browserData.browserColorDepth),
        browserjavaenabled: this.stringify(browserData.browserJavaEnabled),
        browserjavascriptenabled: this.stringify(browserData.browserJavascriptEnabled),
        browserlanguage: this.stringify(browserData.browserLanguage),
        browserscreenheight: this.stringify(browserData.browserScreenHeight),
        browserscreenwidth: this.stringify(browserData.browserScreenWidth),
        browsertz: this.stringify(browserData.browserTZ),
        useragent: this.stringify(browserData.browserUserAgent),
        accept: this.stringify(browserData.browserAcceptHeader),
        customerip: this.stringify(browserData.browserIP),
      }))
    );
  }

  private extendUrlsWithRandomNumbers(): string[] {
    const random = Math.trunc(100000 + Math.random() * 900000).toString();
    return this.browserData3dsServerUrl.map(url => {
      const u = new URL(url);
      if (u.pathname.indexOf('browserData') !== -1) {
        u.searchParams.append('id', random);
      } else {
        u.pathname = u.pathname + '/' + random;
      }
      return this.stringify(u);
    });
  }

  private listenToLogs(): void {
    this.messageBus.pipe(ofType(PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA_LOG))?.subscribe(log => {
      this.sentryService.addBreadcrumb(SentryBreadcrumbsCategories.THREE_DS, log.data?.type + ': ' + log.data?.message);
    });
  }

  private sendErrorMessage(requestUrl: string[]) {
    this.sentryService.sendCustomMessage(
      new RequestTimeoutError('Get browser data error', {
        type: TimeoutDetailsType.BROWSER_DATA,
        requestUrl: requestUrl.join(', '),
      })
    );
  }

  private stringify(value: unknown) {
    return value === undefined ? value : String(value);
  }
}
