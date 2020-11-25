import { ApplePayMock } from './ApplePayMock';
import { ApplePaySessionMock } from './ApplePaySessionMock';
import { anyString, instance, mock, when } from 'ts-mockito';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { EMPTY, of } from 'rxjs';
import { Container } from 'typedi';
import { StoreBasedStorage } from '../../../../shared/services/storage/StoreBasedStorage';
import { SimpleStorage } from '../../../../shared/services/storage/SimpleStorage';

jest.mock('./../../shared/notification/Notification');

Container.set({ id: StoreBasedStorage, type: SimpleStorage });

describe('Class ApplePayMock', () => {
  describe('ApplePayMock.ifApplePayIsAvailable', () => {
    let apInstance: any;
    beforeEach(() => {
      apInstance = applePayMockFixture().apInstance;
    });

    it('should always return true', () => {
      expect(apInstance.ifApplePayIsAvailable()).toBe(true);
    });
  });

  describe('ApplePayMock.setApplePayVersion', () => {
    let apInstance: any;
    beforeEach(() => {
      apInstance = applePayMockFixture().apInstance;
    });

    it('should always set version to 5', () => {
      apInstance.setApplePayVersion();
      expect(apInstance.applePayVersion).toBe(5);
    });
  });

  describe('ApplePayMock.isUserLoggedToAppleAccount', () => {
    let apInstance: any;
    beforeEach(() => {
      apInstance = applePayMockFixture().apInstance;
    });

    it('should always return true', () => {
      expect(apInstance.isUserLoggedToAppleAccount()).toBe(true);
    });
  });

  describe('ApplePayMock.checkApplePayWalletCardAvailability', () => {
    let apInstance: any;
    beforeEach(() => {
      apInstance = applePayMockFixture().apInstance;
    });

    it('should return promise which returns true', () => {
      apInstance.checkApplePayWalletCardAvailability().then((response: boolean) => {
        expect(response).toBe(true);
      });
    });
  });

  describe('ApplePayMock.getApplePaySessionObject', () => {
    let apInstance: any;
    beforeEach(() => {
      apInstance = applePayMockFixture().apInstance;
    });

    it('should always return mock applepay session', () => {
      expect(apInstance.getApplePaySessionObject()).toBe(ApplePaySessionMock);
    });
  });

  describe('ApplePayMock.getApplePaySessionObject', () => {
    let apInstance: any;
    beforeEach(() => {
      apInstance = applePayMockFixture().apInstance;
    });

    it('should always return STATUS_SUCCESS as SUCCESS', () => {
      ApplePaySessionMock.STATUS_SUCCESS = 'SUCCESS';
      ApplePaySessionMock.STATUS_FAILURE = 'ERROR';
      expect(apInstance.getPaymentSuccessStatus()).toBe('SUCCESS');
    });

    it('should always return STATUS_SUCCESS as ERROR', () => {
      ApplePaySessionMock.STATUS_SUCCESS = 'SUCCESS';
      ApplePaySessionMock.STATUS_FAILURE = 'ERROR';
      expect(apInstance.getPaymentFailureStatus()).toBe('ERROR');
    });
  });

  describe('ApplePayMock.createApplePayButton', () => {
    let apInstance: any;
    beforeEach(() => {
      apInstance = applePayMockFixture().apInstance;
    });

    it('should always return Mock button', () => {
      expect(apInstance.createApplePayButton().tagName).toBe('IMG');
      expect(apInstance.createApplePayButton().id).toBe('st-apple-pay');
    });
  });
});

function applePayMockFixture() {
  const config = {
    applePay: {
      paymentRequest: {
        total: { label: 'Secure Trading Merchant', amount: '10.00' },
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: ['amex', 'visa']
      },
      merchantId: 'merchant.net.securetrading',
      placement: 'st-apple-pay',
      buttonText: 'donate',
      buttonStyle: 'white-outline',
      sitesecurity: 'test'
    }
  };
  const configProvider = mock<ConfigProvider>();
  const communicator = mock(InterFrameCommunicator);
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  when(communicator.whenReceive(anyString())).thenReturn({
    thenRespond: () => EMPTY
  });
  when(configProvider.getConfig$()).thenReturn(of({ jwt, disableNotification: false, ...config }));
  const apInstance = new ApplePayMock(instance(configProvider), instance(communicator));
  return { apInstance, config, jwt };
}
