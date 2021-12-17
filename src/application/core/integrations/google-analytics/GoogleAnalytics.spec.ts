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

  describe('init()', () => {
    beforeEach(() => {
      // @ts-ignore
      sentryServiceMock = mock(SentryService);
      when(sentryServiceMock.captureAndReportResourceLoadingTimeout(anyString())).thenReturn(source => source);
      jest.spyOn(DomMethods, 'insertScript').mockReturnValue(of(null));
      sut = new GoogleAnalytics(instance(sentryServiceMock));

      // @ts-ignore
      sut.createGAScript = jest.fn().mockResolvedValueOnce({});
    });

    it('should call insertGALibrary and GoogleAnalytics.disableUserIDTracking', () => {
      sut.init();
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', { async: 'async', src: environment.GA_SCRIPT_SRC, id: 'googleAnalytics' });
    });
  });

  describe('sendGaData', () => {
    beforeEach(() => {
      // @ts-ignore
      window.ga = jest.fn();
      sut.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
    });

    it('should call send method from google analytics', () => {
      // @ts-ignore
      expect(window.ga).toHaveBeenCalled();
    });
  });

  describe('createGAScript', () => {
    beforeEach(() => {
      // @ts-ignore
      sut.createGAScript = jest.fn().mockResolvedValueOnce('Google Analytics: script has been appended');
      sut.init();
    });

    it('should call createGAScript function', () => {
      // @ts-ignore
      expect(sut.createGAScript).toHaveBeenCalledTimes(1);
    });
  });

  describe('insertGALibrary', () => {
    beforeEach(() => {
      // @ts-ignore
      document.head.appendChild = jest.fn();
      document.head;
    });

    it('should append script', async () => {
      // @ts-ignore
      const data = await sut.insertGAScript();
      // @ts-ignore
      expect(data).toEqual('Google Analytics: script has been appended');
    });

    //
    it('should call document.head.appendChild', async () => {
      // @ts-ignore
      await sut.insertGAScript();
      // @ts-ignore
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });
});
