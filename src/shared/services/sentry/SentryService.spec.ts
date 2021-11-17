import { anyFunction, anything, capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { Event } from '@sentry/types';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { IConfig } from '../../model/config/IConfig';
import { Sentry } from './Sentry';
import { SentryContext } from './SentryContext';
import { EventScrubber } from './EventScrubber';
import { SentryService } from './SentryService';
import { ExceptionsToSkip } from './ExceptionsToSkip';
import { JwtMasker } from './JwtMasker';

describe('SentryService', () => {
  const DSN = 'https://123@456.ingest.sentry.io/7890';
  const config = ({ errorReporting: true } as unknown) as IConfig;

  let configProviderMock: ConfigProvider;
  let sentryMock: Sentry;
  let sentryContextMock: SentryContext;
  let eventScrubber: EventScrubber;
  let sentryService: SentryService;
  let jwtMaskerMock: JwtMasker;
  let config$: Subject<IConfig>;

  beforeEach(() => {
    jwtMaskerMock = mock(JwtMasker);
    configProviderMock = mock<ConfigProvider>();
    sentryMock = mock(Sentry);
    sentryContextMock = mock(SentryContext);
    eventScrubber = new EventScrubber(
      instance(jwtMaskerMock)
    );
    config$ = new BehaviorSubject(config);

    when(sentryContextMock.getFrameName()).thenReturn(CONTROL_FRAME_IFRAME);
    when(sentryContextMock.getReleaseVersion()).thenReturn('1.2.3');
    when(sentryContextMock.getHostName()).thenReturn('webservices.securetrading.net');
    when(configProviderMock.getConfig$(true)).thenReturn(config$);

    sentryService = new SentryService(
      instance(configProviderMock),
      instance(sentryMock),
      instance(sentryContextMock),
      eventScrubber
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
          ignoreErrors: ExceptionsToSkip,
          sampleRate: 0.1,
          beforeSend: anyFunction(),
          attachStacktrace: true,
          normalizeDepth: 3,
        })
      )
    ).once();

    setTimeout(() => done());
  });

  it('adds prod environment property in beforeSend when livestatus = 1', done => {
    when(configProviderMock.getConfig$(false)).thenReturn(of({ ...config, livestatus: 1 }));

    const whitelistUrls = ['https://webservices.securetrading.net'];

    sentryService.init(DSN, whitelistUrls);

    const [ args ] = capture(sentryMock.init).last();

    (args.beforeSend({}) as Promise<Event | null>).then(res => {
      expect(res.environment).toBe('prod');
      done();
    });
  });

  it('adds dev environment property in beforeSend when livestatus = 0', done => {
    when(configProviderMock.getConfig$(false)).thenReturn(of({ ...config, livestatus: 0 }));

    const whitelistUrls = ['https://webservices.securetrading.net'];

    sentryService.init(DSN, whitelistUrls);

    const [ args ] = capture(sentryMock.init).last();

    (args.beforeSend({}) as Promise<Event | null>).then(res => {
      expect(res.environment).toBe('dev');
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
});
