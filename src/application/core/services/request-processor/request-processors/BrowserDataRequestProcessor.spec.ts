import { mock, instance, when } from 'ts-mockito';
import { BrowserDataProvider } from '../../three-d-verification/implementations/trust-payments/BrowserDataProvider';
import { BrowserDataRequestProcessor } from './BrowserDataRequestProcessor';
import { of } from 'rxjs';
import { IBrowserData } from '../../three-d-verification/implementations/trust-payments/data/IBrowserData';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';

describe('BrowserDataRequestProcessor', () => {
  let browserDataProviderMock: BrowserDataProvider;
  let browserDataRequestProcessor: BrowserDataRequestProcessor;

  beforeEach(() => {
    browserDataProviderMock = mock(BrowserDataProvider);
    browserDataRequestProcessor = new BrowserDataRequestProcessor(
      instance(browserDataProviderMock),
    );
  });

  describe('process()', () => {
    it('appends browser data to passed request', done => {
      const browserData: IBrowserData = {
        accept: 'accept',
        browsercolordepth: 'browsercolordepth',
        browserjavaenabled: 'browserjavaenabled',
        browserjavascriptenabled: 'browserjavascriptenabled',
        browserlanguage: 'browserlanguage',
        browserscreenheight: 'browserscreenheight',
        browserscreenwidth: 'browserscreenwidth',
        browsertz: 'browsertz',
        customerip: 'customerip',
        useragent: 'useragent',
      };
      const options: IRequestProcessingOptions = {
        jsInitResponse: undefined,
      };

      when(browserDataProviderMock.getBrowserData$()).thenReturn(of(browserData));

      browserDataRequestProcessor.process({ pan: '1234123412341234' }, options).subscribe(result => {
        expect(result).toEqual({
          pan: '1234123412341234',
          accept: 'accept',
          browsercolordepth: 'browsercolordepth',
          browserjavaenabled: 'browserjavaenabled',
          browserjavascriptenabled: 'browserjavascriptenabled',
          browserlanguage: 'browserlanguage',
          browserscreenheight: 'browserscreenheight',
          browserscreenwidth: 'browserscreenwidth',
          browsertz: 'browsertz',
          customerip: 'customerip',
          useragent: 'useragent',
        });
        done();
      })
    });
  });
});
