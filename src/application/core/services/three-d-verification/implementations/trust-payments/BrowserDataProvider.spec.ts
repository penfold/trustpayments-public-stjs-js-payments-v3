import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { BrowserDataProvider } from './BrowserDataProvider';
import { deepEqual, instance, mock, when } from 'ts-mockito';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { BrowserDataInterface } from '@trustpayments/3ds-sdk-js';
import { IBrowserData } from './data/IBrowserData';

describe('BrowserDataProvider', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let sut: BrowserDataProvider;

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    sut = new BrowserDataProvider(instance(interFrameCommunicatorMock));
  });

  it('gets the browser data from parent frame and maps keys to lowercase and values to strings', done => {
    const queryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA,
      data: 'https://acs.3ds.trustpayments.dev/3dss/acs/browser-data',
    };
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
});
