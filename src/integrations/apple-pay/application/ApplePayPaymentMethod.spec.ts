import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayPaymentMethod } from './ApplePayPaymentMethod';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { FrameQueryingService } from '../../../shared/services/message-bus/FrameQueryingService';

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
  let frameQueryingServiceMock: FrameQueryingService;
  let gatewayClientMock: IGatewayClient;

  beforeEach(() => {
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    frameQueryingServiceMock = mock(FrameQueryingService);
    gatewayClientMock = mock<IGatewayClient>();

    applePayPaymentMethod = new ApplePayPaymentMethod(
      instance(requestProcessingInitializerMock),
      instance(frameQueryingServiceMock),
      instance(gatewayClientMock),
    )
  });

  describe('getName()', () => {
    it('returns main name of ApplePay service', () => {
      expect(applePayPaymentMethod.getName()).toBe(ApplePayPaymentMethodName);
    });
  });

  describe('init()', () => {
    it('should send an event to initialize payment by the client side', (done) => {
      when(requestProcessingInitializerMock.initialize()).thenReturn(of(null));
      when(frameQueryingServiceMock.query(anything(), anything())).thenReturn(of(undefined));

      applePayPaymentMethod.init(configMock).subscribe(
        () => {
          verify(requestProcessingInitializerMock.initialize()).once();
          verify(frameQueryingServiceMock.query(anything(), MERCHANT_PARENT_FRAME)).once();
          done();
        }
      )
    });
  });
});
