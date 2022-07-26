import { anyString, instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { environment } from '../../../../environments/environment';
import { GoogleAnalytics } from './GoogleAnalytics';

jest.mock('./../../shared/message-bus/MessageBus');

describe('GoogleAnalytics', () => {
  let sentryServiceMock: SentryService;
  let sut: GoogleAnalytics;

  beforeEach(() => {
    sentryServiceMock = mock(SentryService);
    when(sentryServiceMock.captureAndReportResourceLoadingTimeout(anyString())).thenReturn(source => source);
    jest.spyOn(DomMethods, 'insertScript').mockReturnValue(of(null));
    sut = new GoogleAnalytics(instance(sentryServiceMock));
  });

  describe('init()', () => {
    it('should call insertGALibrary and GoogleAnalytics.disableUserIDTracking', () => {
      sut.init();
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', {
        async: 'async',
        src: environment.GA_SCRIPT_SRC,
      });
    });
  });

  describe('sendGaData', () => {
    const mockGA = jest.fn();
    beforeEach(() => {

      // TODO find a way to mock this properly
      sut['insertGAScript'] = jest.fn().mockReturnValue(of(mockGA))
      sut.init();
      // @ts-ignore
      window.ga = jest.fn();
      sut.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
    });

    it('should call send method from google analytics', () => {
      expect(mockGA).toHaveBeenCalledWith('send', { eventAction: 'payment status', eventCategory: 'Visa Checkout', eventLabel: 'Visa Checkout payment error', hitType: 'event' }
    );
    });
  });

  describe('createGAScript', () => {
    beforeEach(() => {
      sut.init();
    });

    it('should call createGAScript function', () => {
      expect(document.querySelector('script#googleAnalytics')).toBeDefined()
    });
  });
});
