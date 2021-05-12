import { instance, mock, verify, when } from 'ts-mockito';
import { ApplePaySessionWrapper } from './ApplePaySessionWrapper';
import { IApplePaySessionConstructor } from './IApplePaySessionConstructor';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';

type WindowType = Window & { ApplePaySession: IApplePaySessionConstructor | undefined };

describe('ApplePaySessionWrapper', () => {
  const paymentRequest: IApplePayPaymentRequest = {
    countryCode: 'GB',
    currencyCode: 'GBP',
    merchantCapabilities: [],
    supportedNetworks: [],
    total: { amount: '123', label: '' },
  };

  let windowMock: WindowType;
  let applePaySessionConstructorMock: IApplePaySessionConstructor;
  let applePaySessionWrapper: ApplePaySessionWrapper;

  beforeEach(() => {
    windowMock = mock<WindowType>();
    applePaySessionConstructorMock = mock<IApplePaySessionConstructor>();
  });

  describe('when ApplePaySession is available', () => {
    beforeEach(() => {
      when(windowMock.ApplePaySession).thenReturn(instance(applePaySessionConstructorMock));
      applePaySessionWrapper = new ApplePaySessionWrapper(instance(windowMock));
    });

    it('returns true if ApplePaySession is available', () => {
      expect(applePaySessionWrapper.isApplePaySessionAvailable()).toBe(true);
    });

    it('returns whether user can make payments', () => {
      when(applePaySessionConstructorMock.canMakePayments()).thenReturn(true);
      expect(applePaySessionWrapper.canMakePayments()).toBe(true);
      verify(applePaySessionConstructorMock.canMakePayments()).once();
    });

    it('returns whether user can make payments with active card', done => {
      const merchantId = '123';

      when(applePaySessionConstructorMock.canMakePaymentsWithActiveCard(merchantId)).thenResolve(true);

      applePaySessionWrapper.canMakePaymentsWithActiveCard(merchantId).then(result => {
        expect(result).toBe(true);
        verify(applePaySessionConstructorMock.canMakePaymentsWithActiveCard(merchantId)).once();
        done();
      });
    });

    it('returns whether session supports given version', () => {
      const version = 123;
      when(applePaySessionConstructorMock.supportsVersion(version)).thenReturn(true);
      expect(applePaySessionWrapper.supportsVersion(version)).toBe(true);
      verify(applePaySessionConstructorMock.supportsVersion(version)).once();
    });

    it('creates a new instance of ApplePaySession', () => {
      function ApplePaySession(version: number, request: IApplePayPaymentRequest) {
        this.version = version;
        this.request = request;
      }

      applePaySessionWrapper = new ApplePaySessionWrapper(({ ApplePaySession } as unknown) as WindowType);

      const result = applePaySessionWrapper.createInstance(123, paymentRequest) as any;

      expect(result).toBeInstanceOf(ApplePaySession);
      expect(result.version).toBe(123);
      expect(result.request).toBe(paymentRequest);
    });
  });

  describe('when ApplePaySession is not available', () => {
    const errorMessage = 'ApplePaySession is not available.';

    beforeEach(() => {
      when(windowMock.ApplePaySession).thenReturn(undefined);
      applePaySessionWrapper = new ApplePaySessionWrapper(instance(windowMock));
    });

    it('returns false if ApplePaySession is available', () => {
      expect(applePaySessionWrapper.isApplePaySessionAvailable()).toBe(false);
    });

    it('throws error when checking whether user can make payments', () => {
      expect(() => applePaySessionWrapper.canMakePayments()).toThrowError(errorMessage);
    });

    it('throws error when checking whether user can make payments with active card', () => {
      expect(() => applePaySessionWrapper.canMakePaymentsWithActiveCard('123')).toThrowError(errorMessage);
    });

    it('throws error when checking whether session supports given version', () => {
      expect(() => applePaySessionWrapper.supportsVersion(123)).toThrowError(errorMessage);
    });

    it('throws error when creating a new ApplePaySession instance', () => {
      expect(() => applePaySessionWrapper.createInstance(123, paymentRequest)).toThrowError(errorMessage);
    });
  });
});
