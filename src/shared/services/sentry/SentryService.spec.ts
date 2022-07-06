import { anyFunction, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { delay, first } from 'rxjs/operators';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { IConfig } from '../../model/config/IConfig';
import { environment } from '../../../environments/environment';
import { JwtProvider } from '../jwt-provider/JwtProvider';
import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { Sentry } from './Sentry';
import { SentryContext } from './SentryContext/SentryContext';
import { SentryEventScrubber } from './SentryEventScrubber/SentryEventScrubber';
import { SentryService } from './SentryService';
import { RequestTimeoutError } from './errors/RequestTimeoutError';
import { PayloadSanitizer } from './PayloadSanitizer/PayloadSanitizer';
import { SENTRY_INIT_BROWSER_OPTIONS } from './constants/SentryBrowserOptions';
import { SentryEventExtender } from './SentryEventExtender/SentryEventExtender';
import { SentryEventFilteringService } from './SentryEventFiltering/SentryEventFilteringService';

// TODO disabled due to https://securetrading.atlassian.net/browse/STJS-3609
describe.skip('SentryService', () => {
  const DSN = 'https://123@456.ingest.sentry.io/7890';
  const config = ({ errorReporting: true } as unknown) as IConfig;

  let configProviderMock: ConfigProvider;
  let sentryMock: Sentry;
  let sentryContextMock: SentryContext;
  let eventScrubberMock: SentryEventScrubber;
  let sentryService: SentryService;
  let jwtProviderMock: JwtProvider;
  let payloadSanitizerMock: PayloadSanitizer;
  let sentryEventExtender: SentryEventExtender;
  let sentryEventFilteringService: SentryEventFilteringService;
  const jwtPayloadChangesMock = new BehaviorSubject<IStJwtPayload>({ sitereference: 'test-site-reference' });
  let config$: Subject<IConfig>;

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();
    sentryMock = mock(Sentry);
    sentryContextMock = mock(SentryContext);
    jwtProviderMock = mock(JwtProvider);
    payloadSanitizerMock = mock(PayloadSanitizer);
    sentryEventExtender = mock(SentryEventExtender);
    sentryEventFilteringService =  mock(SentryEventFilteringService);

    when(sentryMock.setExtra(anything(), anything())).thenCall((...args) => console.log(args));
    eventScrubberMock = mock(SentryEventScrubber);
    config$ = new BehaviorSubject(config);

    when(sentryContextMock.getFrameName()).thenReturn(CONTROL_FRAME_IFRAME);
    when(sentryContextMock.getReleaseVersion()).thenReturn('1.2.3');
    when(sentryContextMock.getHostName()).thenReturn('webservices.securetrading.net');
    when(configProviderMock.getConfig$(true)).thenReturn(config$);
    when(jwtProviderMock.getJwtPayload()).thenReturn(jwtPayloadChangesMock);
    when(eventScrubberMock.scrubEvent()).thenCall(event => of(event));
    when(jwtProviderMock.getJwtPayload()).thenReturn(jwtPayloadChangesMock);

    sentryService = new SentryService(
      instance(configProviderMock),
      instance(sentryMock),
      instance(sentryContextMock),
      instance(eventScrubberMock),
      instance(jwtProviderMock),
      instance(payloadSanitizerMock),
      instance(sentryEventExtender),
      instance(sentryEventFilteringService)
    );
  });

  it('doesnt initialize sentry if dsn is empty', () => {
    sentryService.init(null);

    verify(sentryMock.init(anything())).never();
  });

  it('doesnt initialize sentry if errorReporting is set to false', () => {
    config$.next({ errorReporting: false } as IConfig);

    sentryService.init(null);

    verify(sentryMock.init(anything())).never();
  });

  it('initializes sentry with options', done => {
    const whitelistUrls = ['https://webservices.securetrading.net'];

    sentryService.init(DSN, whitelistUrls);

    verify(sentryMock.setTag('hostName', 'webservices.securetrading.net')).once();
    verify(sentryMock.setTag('frameName', CONTROL_FRAME_IFRAME)).once();
    verify(sentryMock.setExtra('config', config));
    verify(
      sentryMock.init(
        deepEqual({
          allowUrls: whitelistUrls,
          dsn: DSN,
          release: '1.2.3',
         ...SENTRY_INIT_BROWSER_OPTIONS,
          beforeBreadcrumb: anyFunction(),
          beforeSend: anyFunction(),
        })
      )
    ).once();

    setTimeout(() => done());
  });

  describe.each([
    { sitereference: 'test-site-1' },
    { sitereference: 'test-site-2' },
    {},
    { sitereference: null },
  ] as IStJwtPayload[])('subscribes to jwt payload changes', (jwtPayload: IStJwtPayload) => {
    it('and sets"site_reference" field in Sentry events "additional data" section with sitereference field value from jwt payload', done => {
      // first() is used because jwtProvider mock is created before each test
      jwtPayloadChangesMock.pipe(first()).subscribe((change) => {
        verify(sentryMock.setUser({ id: jwtPayload?.sitereference })).once();
      });

      jwtPayloadChangesMock.next(jwtPayload);
      done();
    });
  });

  it('sets config-provider to extras whenever config-provider changes', () => {
    sentryService.init(DSN);

    config$.next(config);
    config$.next(config);
    config$.next(config);

    verify(sentryMock.setExtra('config', config)).times(4);
  });

  describe('captureAndReportResourceLoadingTimeout()', () => {
    it('should set timeout do given observable stream and throw RequestTimeout with provided message when source doesn\'t emit in set timeout', () => {
      jest.useFakeTimers();
      const scriptLoadTiemout = environment.SCRIPT_LOAD_TIMEOUT;
      const delayedObservable = of(null).pipe(delay(scriptLoadTiemout + 1));
      const instantObservable = of('some value');

      jest.runAllTimers();
      delayedObservable.pipe(
        sentryService.captureAndReportResourceLoadingTimeout('custom message')
      ).subscribe({
        next: () => {
        },
        error: (error: RequestTimeoutError) => {
          expect(error.message).toEqual('custom message');
          expect(error instanceof RequestTimeoutError).toBe(true);
        },
      });
      instantObservable.pipe(
        sentryService.captureAndReportResourceLoadingTimeout('custom message')
      ).subscribe(value => expect(value).toEqual('some value'));
    });
  });
});
