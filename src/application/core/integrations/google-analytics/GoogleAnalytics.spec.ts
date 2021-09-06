import { GoogleAnalytics } from './GoogleAnalytics';

jest.mock('./../../shared/message-bus/MessageBus');

describe('GoogleAnalytics', () => {
  const { instance } = googleAnalyticsFixture();

  describe('_onInit', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.insertGALibrary = jest.fn();
      // @ts-ignore
      instance.createGAScript = jest.fn().mockResolvedValueOnce({});
    });

    it('should call _insertGALibrary and GoogleAnalytics.disableUserIDTracking', () => {
      // @ts-ignore
      instance.init();
      // @ts-ignore
      expect(instance.insertGALibrary).toHaveBeenCalled();
    });
  });

  describe('sendGaData', () => {
    beforeEach(() => {
      // @ts-ignore
      window.ga = jest.fn();
      // @ts-ignore
      GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
    });

    it('should call send method from google analytics', () => {
      // @ts-ignore
      expect(window.ga).toHaveBeenCalled();
    });
  });

  describe('_createGAScript', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.createGAScript = jest.fn().mockResolvedValueOnce(GoogleAnalytics.TRANSLATION_SCRIPT_SUCCEEDED);
      // @ts-ignore
      instance.init();
    });

    it('should call _createGAScript function', () => {
      // dummy test
      // @ts-ignore
      expect(instance.createGAScript).toHaveBeenCalledTimes(1);
    });
  });

  describe('_insertGALibrary', () => {
    beforeEach(() => {
      // @ts-ignore
      document.head.appendChild = jest.fn();
      document.head;
    });

    it('should append script', async () => {
      // @ts-ignore
      const data = await instance.insertGAScript();
      // @ts-ignore
      expect(data).toEqual(GoogleAnalytics.TRANSLATION_SCRIPT_APPENDED);
    });

    //
    it('should call document.head.appendChild', async () => {
      // @ts-ignore
      await instance.insertGAScript();
      // @ts-ignore
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });
});

function googleAnalyticsFixture() {
  const instance = new GoogleAnalytics();
  return { instance };
}
