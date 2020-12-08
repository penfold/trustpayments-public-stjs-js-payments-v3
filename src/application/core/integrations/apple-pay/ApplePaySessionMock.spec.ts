import { ApplePaySessionMock } from './ApplePaySessionMock';

describe('Class ApplePaySessionMock', () => {
  describe('ApplePayMock.completePayment', () => {
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
    });

    it('should always return true', () => {
      expect(session.completePayment()).toBe(true);
    });
  });

  describe('ApplePayMock.completeMerchantValidation', () => {
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
    });

    it('should always return true', () => {
      expect(session.completeMerchantValidation()).toBe(true);
    });
  });

  describe('ApplePayMock.completePaymentMethodSelection', () => {
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
    });

    describe('ApplePayMock.begin()', () => {
      let handleResp: any;
      beforeEach(() => {
        session = applePaySessionMockFixture().session;
        handleResp = session._handleResponse;
        session._handleResponse = jest.fn();
      });

      it('should call _handleResponse on successful fetch', async () => {
        const mockResponse = { json: jest.fn().mockReturnValue({ payment: 'somedata', status: 'SUCCESS' }) };
        // @ts-ignore
        global.fetch = jest.fn().mockResolvedValue(mockResponse);
        await session.begin();
        expect(session._handleResponse).toHaveBeenCalledTimes(1);
        expect(session._handleResponse).toHaveBeenCalledWith({ payment: 'somedata', status: 'SUCCESS' });
      });

      afterEach(() => {
        session._handleResponse = handleResp;
      });
    });

    it('should always return true', () => {
      expect(session.completePaymentMethodSelection()).toBe(true);
    });
  });

  describe('ApplePayMock._handleResponse', () => {
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
      session.onpaymentauthorized = jest.fn();
      session.oncancel = jest.fn();
    });

    it('should call onsuccess', () => {
      session._handleResponse({
        status: 'SUCCESS'
      });
      expect(session.onpaymentauthorized).toHaveBeenCalledTimes(1);
      expect(session.oncancel).toHaveBeenCalledTimes(0);
      expect(session.onpaymentauthorized).toHaveBeenCalledWith({
        status: 'SUCCESS'
      });
    });

    it('should call oncancel', () => {
      session._handleResponse({
        status: 'ERROR'
      });
      expect(session.onpaymentauthorized).toHaveBeenCalledTimes(0);
      expect(session.oncancel).toHaveBeenCalledTimes(1);
      expect(session.oncancel).toHaveBeenCalledWith({
        status: 'ERROR'
      });
    });
  });
});

function applePaySessionMockFixture() {
  const session = ApplePaySessionMock;
  return { session };
}
