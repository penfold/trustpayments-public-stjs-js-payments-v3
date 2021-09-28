import { Observable, of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IConfig } from '../../../shared/model/config/IConfig';
import { APMPaymentMethod } from './APMPaymentMethod';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { FrameQueryingServiceMock } from '../../../shared/services/message-bus/FrameQueryingServiceMock';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';

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

  let zipPaymentMethod: APMPaymentMethod;
  let requestProcessingInitializerMock: RequestProcessingInitializer;
  let requestProcessingServiceMock: IRequestProcessingService;
  let frameQueryingServiceMock: IFrameQueryingService;
  let gatewayClientMock: IGatewayClient;

  beforeEach(() => {
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    frameQueryingServiceMock = new FrameQueryingServiceMock();
    gatewayClientMock = mock<IGatewayClient>();
    requestProcessingServiceMock = mock<IRequestProcessingService>();

    zipPaymentMethod = new APMPaymentMethod(
      instance(requestProcessingInitializerMock),
      frameQueryingServiceMock,
      instance(gatewayClientMock),
      null
    );

    when(requestProcessingInitializerMock.initialize()).thenReturn(new Observable<IRequestProcessingService>(subscriber => {
      subscriber.next(instance(requestProcessingServiceMock));
      subscriber.complete();
    }));

    frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT, () => of(undefined));
  });

  describe('getName()', () => {
    it('returns main name of ApplePay service', () => {
    });
  });

  describe('init()', () => {
  });

  describe('start()', () => {
    it('runs wallet verification request on APPLE_PAY_VALIDATE_MERCHANT_2 event', () => {
    });

    it('runs payment authorization request on APPLE_PAY_AUTHORIZATION_2 event', done => {
    });
  });
});
