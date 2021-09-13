import { GoogleAnalytics } from './GoogleAnalytics';

jest.mock('./../../shared/message-bus/MessageBus');

describe('GoogleAnalytics', () => {
  const instance = new GoogleAnalytics();

  describe('init()', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.insertGALibrary = jest.fn();
      // @ts-ignore
      instance.createGAScript = jest.fn().mockResolvedValueOnce({});
    });

    it('should call insertGALibrary and GoogleAnalytics.disableUserIDTracking', () => {
      instance.init();
      // @ts-ignore
      expect(instance.insertGALibrary).toHaveBeenCalled();
    });
  });

  describe('sendGaData', () => {
    beforeEach(() => {
      // @ts-ignore
      window.ga = jest.fn();
      instance.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
    });

    it('should call send method from google analytics', () => {
      // @ts-ignore
      expect(window.ga).toHaveBeenCalled();
    });
  });

  describe('createGAScript', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.createGAScript = jest.fn().mockResolvedValueOnce('Google Analytics: script has been appended');
      instance.init();
    });

    it('should call createGAScript function', () => {
      // @ts-ignore
      expect(instance.createGAScript).toHaveBeenCalledTimes(1);
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
      const data = await instance.insertGAScript();
      // @ts-ignore
      expect(data).toEqual('Google Analytics: script has been appended');
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
