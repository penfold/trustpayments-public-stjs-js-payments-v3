import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { BrowserDataInterface } from '@trustpayments/3ds-sdk-js';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { environment } from '../../../../../../environments/environment';
import { SentryService } from '../../../../../../shared/services/sentry/SentryService';
import { RequestTimeoutError } from '../../../../../../shared/services/sentry/errors/RequestTimeoutError';
import { TimeoutDetailsType } from '../../../../../../shared/services/sentry/constants/RequestTimeout';
import { IMessageBus } from '../../../../shared/message-bus/IMessageBus';
import { BrowserDataProvider } from './BrowserDataProvider';
import { IBrowserData } from './data/IBrowserData';

describe('BrowserDataProvider', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let messageBusMock: IMessageBus;
  let sut: BrowserDataProvider;
  let sentryServiceMock: SentryService;
  const browserData: BrowserDataInterface = {
    browserJavaEnabled: true,
    browserJavascriptEnabled: true,
    browserLanguage: 'en',
    browserScreenWidth: 800,
    browserScreenHeight: 600,
    browserColorDepth: 24,
    browserUserAgent: 'chrome',
    browserTZ: 0,
    browserAcceptHeader: 'acceptHeaderMock',
    browserIP: 'ipMock',
  };

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    sentryServiceMock = mock(SentryService);
    messageBusMock = mock<IMessageBus>();
    sut = new BrowserDataProvider(instance(interFrameCommunicatorMock), instance(sentryServiceMock), instance(messageBusMock));
  });

  it('gets the browser data from parent frame and maps keys to lowercase and values to strings', done => {

    const extendedUrls = [
      environment.BROWSER_DATA_URLS[0] + '?123456',
      environment.BROWSER_DATA_URLS[1] + '/123456',
      environment.BROWSER_DATA_URLS[2] + '/123456',
    ];

    const queryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA,
      data: extendedUrls,
    };

    // @ts-ignore
    sut.extendUrlsWithRandomNumbers = jest.fn().mockReturnValue(extendedUrls);
    when(interFrameCommunicatorMock.query(deepEqual(queryEvent), MERCHANT_PARENT_FRAME)).thenResolve(browserData);

    sut.getBrowserData$().subscribe((result: IBrowserData) => {
      expect(result).toEqual({
        browserjavaenabled: 'true',
        browserjavascriptenabled: 'true',
        browserlanguage: 'en',
        browserscreenwidth: '800',
        browserscreenheight: '600',
        browsercolordepth: '24',
        useragent: 'chrome',
        browsertz: '0',
        accept: 'acceptHeaderMock',
        customerip: 'ipMock',
      });
      done();
    });
  });

  describe('send error if no customerIp', () => {
    const extendedUrls = [
      environment.BROWSER_DATA_URLS[0] + '?123456',
      environment.BROWSER_DATA_URLS[1] + '/123456',
      environment.BROWSER_DATA_URLS[2] + '/123456',
    ];

    const queryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA,
      data: extendedUrls,
    };

    const browserDataLocal: BrowserDataInterface = {
      ...browserData,
      browserIP: '',
    };

    it('without query parameter', done => {

      // @ts-ignore
      sut.extendUrlsWithRandomNumbers = jest.fn().mockReturnValue(extendedUrls);
      when(interFrameCommunicatorMock.query(deepEqual(queryEvent), MERCHANT_PARENT_FRAME)).thenResolve(browserDataLocal);

      sut.getBrowserData$().subscribe(() => {
        verify(
          sentryServiceMock.sendCustomMessage(
            deepEqual(
              new RequestTimeoutError('Get browser data error', {
                type: TimeoutDetailsType.BROWSER_DATA,
                requestUrl: (queryEvent.data as string[]).join(', '),
              })
            )
          )
        ).once();
        done();
      });
    });
  });
});
