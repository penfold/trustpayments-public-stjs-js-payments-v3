import { of, throwError } from 'rxjs';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayPaymentMethod } from './ApplePayPaymentMethod';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { FrameQueryingServiceMock } from '../../../shared/services/message-bus/FrameQueryingServiceMock';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { ApplePayResultHandlerService } from './ApplePayResultHandlerService';

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
  let frameQueryingServiceMock: IFrameQueryingService;
  let gatewayClientMock: IGatewayClient;
  let applePayResultHandlerServiceMock: ApplePayResultHandlerService;

  beforeEach(() => {
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    frameQueryingServiceMock = new FrameQueryingServiceMock();
    gatewayClientMock = mock<IGatewayClient>();
    applePayResultHandlerServiceMock = mock(ApplePayResultHandlerService);

    applePayPaymentMethod = new ApplePayPaymentMethod(
      instance(requestProcessingInitializerMock),
      frameQueryingServiceMock,
      instance(gatewayClientMock),
      instance(applePayResultHandlerServiceMock),
    );

    frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT, () => of(undefined));
  });

  describe('getName()', () => {
    it('returns main name of ApplePay service', () => {
      expect(applePayPaymentMethod.getName()).toBe(ApplePayPaymentMethodName);
    });
  });

  describe('init()', () => {
    it('should send an event to initialize payment by the client side', (done) => {
      when(requestProcessingInitializerMock.initialize()).thenReturn(of(null));

      const frameQueryingServiceSpy = spy(frameQueryingServiceMock);

      applePayPaymentMethod.init(configMock).subscribe(() => {
        verify(requestProcessingInitializerMock.initialize()).once();
        verify(frameQueryingServiceSpy.query(
          deepEqual({ type: PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT, data: configMock }),
          MERCHANT_PARENT_FRAME,
        )).once();
        done();
      });
    });
  });

  describe('start()', () => {
    const validateMerchantRequest: IApplePayValidateMerchantRequest = {
      walletmerchantid: '',
      walletrequestdomain: '',
      walletsource: '',
      walletvalidationurl: '',
    };

    const validateMerchantResponse: IApplePayWalletVerifyResponseBody = {
      errorcode: '0',
      walletsource: 'APPLEPAY',
      customeroutput: '',
      walletsession: '',
      requestid: '',
      transactionstartedtimestamp: '',
      errormessage: '',
      jwt: '',
      requesttypedescription: 'WALLETVERIFY',
    };

    beforeEach(() => {
      when(gatewayClientMock.walletVerify(validateMerchantRequest)).thenReturn(of(validateMerchantResponse));
    });

    it('runs wallet verification request on APPLE_PAY_VALIDATE_MERCHANT_2 event', () => {
      applePayPaymentMethod.start().subscribe();

      frameQueryingServiceMock.query({
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
        data: validateMerchantRequest,
      }, null);

      verify(gatewayClientMock.walletVerify(validateMerchantRequest)).once();
    });

    it('returns FAILURE result when WALLETVERIFY response errorcode!=0', done => {
      const errorResponse = {
        ...validateMerchantResponse,
        errorcode: '123',
        errormessage: 'error',
      };

      when(gatewayClientMock.walletVerify(validateMerchantRequest)).thenReturn(of(errorResponse));

      applePayPaymentMethod.start().subscribe(result => {
        expect(result).toEqual({
          status: PaymentStatus.FAILURE,
          data: errorResponse,
          error: {
            code: 123,
            message: 'error',
          },
        });
        done();
      });

      frameQueryingServiceMock.query({
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
        data: validateMerchantRequest,
      }, null);
    });

    it('returns ERROR result on WALLETVERIFY request error', done => {
      const requestError = new Error('error');

      when(gatewayClientMock.walletVerify(validateMerchantRequest)).thenReturn(throwError(() => requestError));

      applePayPaymentMethod.start().subscribe({
        error: errorResult => {
          expect(errorResult).toEqual({
            status: PaymentStatus.ERROR,
            data: requestError,
            error: {
              code: 50003,
              message: 'error',
            },
          });
          done();
        },
      });

      frameQueryingServiceMock.query({
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
        data: validateMerchantRequest,
      }, null);
    });
  });
});
