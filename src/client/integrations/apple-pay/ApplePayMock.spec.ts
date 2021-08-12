import { mock, instance as mockInstance } from 'ts-mockito';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { ApplePayErrorService } from '../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorService';
import { ApplePayGestureService } from '../../../application/core/integrations/apple-pay/apple-pay-gesture-service/ApplePayGestureService';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { ApplePayMock } from './ApplePayMock';

describe('ApplePayMock', () => {
  const applePayButtonService = mock(ApplePayButtonService);
  const applePayConfigService = mock(ApplePayConfigService);
  const applePayErrorService = mock(ApplePayErrorService);
  const applePayGestureService = mock(ApplePayGestureService);
  const applePaySessionFactory = mock(ApplePaySessionFactory);
  const applePaySessionService = mock(ApplePaySessionService);
  const interFrameCommunicator = mock(InterFrameCommunicator);
  const messageBus = mock<IMessageBus>();

  const applePayMock = new ApplePayMock(
    mockInstance(applePayButtonService),
    mockInstance(applePayConfigService),
    mockInstance(applePayErrorService),
    mockInstance(applePayGestureService),
    mockInstance(applePaySessionFactory),
    mockInstance(applePaySessionService),
    mockInstance(interFrameCommunicator),
    mockInstance(messageBus)
  );

  describe('test functions to check expected results', () => {
    it('returns true for ifApplePayIsAvailable', () => {
      expect(applePayMock.ifApplePayIsAvailable()).toBe(true);
    });

    it('returns true for isUserLoggedToAppleAccount', () => {
      expect(applePayMock.isUserLoggedToAppleAccount()).toBe(true);
    });

    it('returns true for checkApplePayWalletCardAvailability', done => {
      applePayMock.checkApplePayWalletCardAvailability().then(value => {
        expect(value).toBe(true);
        done();
      });
    });

    it('returns SUCCESS for getPaymentSuccessStatus', () => {
      expect(applePayMock.getPaymentSuccessStatus()).toBe('SUCCESS');
    });

    it('returns FAILURE for getPaymentFailureStatus', () => {
      expect(applePayMock.getPaymentFailureStatus()).toBe('FAILURE');
    });
  });
});
