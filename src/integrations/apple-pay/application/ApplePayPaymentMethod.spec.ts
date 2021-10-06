import { firstValueFrom, Observable, of } from 'rxjs';
import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
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
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { ApplePayResponseHandlerService } from './ApplePayResponseHandlerService';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { CustomerOutput } from '../../../application/core/models/constants/CustomerOutput';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { tap } from 'rxjs/operators';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';

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
  let requestProcessingServiceMock: IRequestProcessingService;
  let frameQueryingServiceMock: IFrameQueryingService;
  let gatewayClientMock: IGatewayClient;
  let applePayResponseHandlerServiceMock: ApplePayResponseHandlerService;
  let simpleMessageBus: IMessageBus;

  beforeEach(() => {
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    frameQueryingServiceMock = new FrameQueryingServiceMock();
    gatewayClientMock = mock<IGatewayClient>();
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    applePayResponseHandlerServiceMock = mock(ApplePayResponseHandlerService);
    simpleMessageBus = new SimpleMessageBus();

    applePayPaymentMethod = new ApplePayPaymentMethod(
      instance(requestProcessingInitializerMock),
      frameQueryingServiceMock,
      instance(gatewayClientMock),
      instance(applePayResponseHandlerServiceMock),
      simpleMessageBus,
    );

    when(requestProcessingInitializerMock.initialize()).thenReturn(new Observable<IRequestProcessingService>(subscriber => {
      subscriber.next(instance(requestProcessingServiceMock));
      subscriber.complete();
    }));

    frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT, () => of(undefined));
  });

  describe('getName()', () => {
    it('returns main name of ApplePay service', () => {
      expect(applePayPaymentMethod.getName()).toBe(ApplePayPaymentMethodName);
    });
  });

  describe('init()', () => {
    it('should send an event to initialize payment by the client side', (done) => {
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
    const applePayConfig: IApplePayConfigObject = {
     applePayConfig: null,
     paymentRequest: null,
     merchantUrl: 'https://merchanturl',
     validateMerchantRequest: null,
     jwtFromConfig: '',
     applePayVersion: 0,
     locale: 'en_GB',
     formId: '',
    };

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

    const authorizePaymentRequest: IApplePayGatewayRequest = {
      walletsource: 'walletsource',
      wallettoken: 'wallettoken',
    };

    const authorizePaymentResponse: IRequestTypeResponse = {
      requesttypedescription: 'AUTH',
      errorcode: '0',
      errormessage: '',
      customeroutput: CustomerOutput.RESULT,
    };

    const validateMerchantResponseObservable = of(validateMerchantResponse);
    const authorizePaymentResponseObservable = of(authorizePaymentResponse);
    const paymentResult: IPaymentResult<IRequestTypeResponse> = {
      data: authorizePaymentResponse,
      paymentMethodName: ApplePayPaymentMethodName,
      status: PaymentStatus.SUCCESS,
    };

    beforeEach(() => {
      when(gatewayClientMock.walletVerify(validateMerchantRequest)).thenReturn(validateMerchantResponseObservable);
      when(requestProcessingServiceMock.process(anything(), anything())).thenReturn(authorizePaymentResponseObservable);
      when(applePayResponseHandlerServiceMock.handleWalletVerifyResponse(anything(), anything())).thenCall(response => response);
      when(applePayResponseHandlerServiceMock.handlePaymentResponse(anything(), anything())).thenCall((response, subscriber) => {
        return response.pipe(
          tap(() => {
            subscriber.next(paymentResult);
            subscriber.complete();
          }),
        );
      });

      applePayPaymentMethod.init(configMock).subscribe();
    });

    it('runs wallet verification request on APPLE_PAY_VALIDATE_MERCHANT_2 event', () => {
      applePayPaymentMethod.start(applePayConfig).subscribe();

      frameQueryingServiceMock.query({
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
        data: validateMerchantRequest,
      }, null);

      verify(gatewayClientMock.walletVerify(validateMerchantRequest)).once();
      verify(applePayResponseHandlerServiceMock.handleWalletVerifyResponse(validateMerchantResponseObservable, anything())).once();
    });

    it('runs payment authorization request on APPLE_PAY_AUTHORIZATION_2 event', done => {
      applePayPaymentMethod.start(applePayConfig).subscribe(async result => {
        verify(requestProcessingServiceMock.process(authorizePaymentRequest, 'https://merchanturl')).once();
        verify(applePayResponseHandlerServiceMock.handlePaymentResponse(anything(), anything())).once();
        const [responseObservable] = capture(applePayResponseHandlerServiceMock.handlePaymentResponse).first();
        expect(await firstValueFrom(responseObservable)).toBe(authorizePaymentResponse);
        expect(result).toBe(paymentResult);
        done();
      });

      frameQueryingServiceMock.query({
        type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION_2,
        data: authorizePaymentRequest,
      }, null);
    });

    it('cancel payment on APPLE_PAY_CANCELLED event', done => {
      const responseMock = {
        status: PaymentStatus.CANCEL,
        data: {},
        error: {
          code: 50003,
          message: 'Payment has been cancelled',
        },
        paymentMethodName: ApplePayPaymentMethodName,
      };

      applePayPaymentMethod.start(applePayConfig).subscribe(result => {
        expect(result).toBe(responseMock)
        done();
      });

      when(applePayResponseHandlerServiceMock.handleCancelResponse(anything())).thenCall((subscriber) => {
        subscriber.next(responseMock);
        subscriber.complete();
      });

      simpleMessageBus.publish({ type: PUBLIC_EVENTS.APPLE_PAY_CANCELLED });
    });
  });
});
