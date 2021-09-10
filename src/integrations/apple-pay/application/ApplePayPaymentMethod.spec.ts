import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IConfig } from '../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ApplePayPaymentMethod } from './ApplePayPaymentMethod';

describe('ApplePayPaymentMethod', () => {
  const configMock: IConfig = {
    applePay: {
      buttonStyle: 'white-outline',
      buttonText: 'buy',
      merchantId: 'merchant.net.securetrading.test',
      paymentRequest: {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: [
          'supports3DS',
          'supportsCredit',
          'supportsDebit',
        ],
        supportedNetworks: ['visa', 'amex'],
        total: {
          label: 'Secure Trading Merchant',
          amount: '10.00',
        },
      },
      placement: 'st-apple-pay',
    },
  };

  let applePayPaymentMethod: ApplePayPaymentMethod;
  let requestProcessingInitializerMock: RequestProcessingInitializer;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let gatewayClientMock: IGatewayClient;

  beforeEach(() => {
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    gatewayClientMock = mock<IGatewayClient>();

    applePayPaymentMethod = new ApplePayPaymentMethod(
      instance(requestProcessingInitializerMock),
      instance(interFrameCommunicatorMock),
      instance(gatewayClientMock)
    )
  });

  describe('getName()', () => {
    it('returns main name of ApplePay service', () => {
      expect(applePayPaymentMethod.getName()).toBe('ApplePay');
    });
  });

  describe('init()', () => {
    it('should send an event to initialize payment by the client side', (done) => {
      when(requestProcessingInitializerMock.initialize()).thenReturn(of(null));
      when(interFrameCommunicatorMock.query(anything(), anything())).thenReturn(new Promise((resolve) => resolve(null)));

      applePayPaymentMethod.init(configMock).subscribe(
        () => {
          verify(requestProcessingInitializerMock.initialize()).once();
          verify(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).once();
          done();
        }
      )
    });
  });
});
