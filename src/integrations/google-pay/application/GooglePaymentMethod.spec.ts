import { anything, instance, mock, verify, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { GooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { IPaymentError } from '../../../application/core/services/payments/IPaymentError';
import { IGooglePayGatewayRequest } from '../models/IGooglePayRequest';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { GooglePayConfigName, IGooglePayConfig } from '../models/IGooglePayConfig';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IConfig } from '../../../shared/model/config/IConfig';
import { GooglePaymentMethod } from './GooglePaymentMethod';

describe('GooglePaymentMethod', () => {
  let requestProcessingServiceMock: IRequestProcessingService;
  let requestProcessingInitializerMock: RequestProcessingInitializer;
  let configProviderMock: ConfigProvider;
  let googlePaymentMethod: GooglePaymentMethod;
  let frameQueryingServiceMock: IFrameQueryingService;

  const paymentResponse: IRequestTypeResponse = {
    errorcode: '0',
    errormessage: 'payment succeeded',
    requesttypedescription: 'AUTH',
  };

  const googlePayGatewayRequest: IGooglePayGatewayRequest = {
    walletsource: 'GOOGLE_PAY',
    wallettoken: 'wallettoken',
  };

  beforeEach(() => {
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    when(frameQueryingServiceMock.query(anything(), anything())).thenReturn(of(null));
    configProviderMock = mock<ConfigProvider>();
    googlePaymentMethod = new GooglePaymentMethod(
      instance(requestProcessingInitializerMock),
      instance(configProviderMock),
      instance(frameQueryingServiceMock)
    );

    when(requestProcessingServiceMock.process(anything(), anything())).thenReturn(of(paymentResponse));
    when(requestProcessingInitializerMock.initialize()).thenReturn(of(null).pipe((mapTo(instance(requestProcessingServiceMock)))));
    when(configProviderMock.getConfig()).thenReturn({ [GooglePayConfigName]: {} as IGooglePayConfig });
  });

  describe('getName()', () => {
    it('returns GooglePaymentMethod name', () => {
      expect(googlePaymentMethod.getName()).toBe(GooglePaymentMethodName);
    });
  });

  describe('init()', () => {
    it('should initialize request processing service and init GooglePay', done => {
      googlePaymentMethod.init({} as IConfig).subscribe(() => {
        verify(requestProcessingInitializerMock.initialize()).once();
        verify(frameQueryingServiceMock.query(anything(), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('start()', () => {
    beforeEach(() => {
      googlePaymentMethod.init({} as IConfig).subscribe();
    });

    it('performs request processing and returns the PaymentResult', done => {
      googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
        expect(result).toEqual({
          status: PaymentStatus.SUCCESS,
          data: paymentResponse,
          paymentMethodName: GooglePaymentMethodName,
        });

        verify(requestProcessingServiceMock.process(googlePayGatewayRequest, undefined)).once();

        done();
      });
    });

    it('returns payment result with error status if errorcode != 0', done => {
      const errorResponse: IRequestTypeResponse = { ...paymentResponse, errorcode: '1234' };

      when(requestProcessingServiceMock.process(googlePayGatewayRequest, undefined)).thenReturn(of(errorResponse));

      googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
        expect(result).toMatchObject({
          status: PaymentStatus.ERROR,
          data: errorResponse,
          paymentMethodName: GooglePaymentMethodName,
        });
        done();
      });
    });

    it('adds error object with errorcode and errormessage to payment result if errorcode != 0', done => {
      const errorResponse: IRequestTypeResponse = {
        ...paymentResponse,
        errorcode: '70000',
        errormessage: 'Payment declined',
      };

      when(requestProcessingServiceMock.process(googlePayGatewayRequest, undefined)).thenReturn(of(errorResponse));

      googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
        expect(result.error).toEqual(<IPaymentError>{
          message: errorResponse.errormessage,
          code: Number(errorResponse.errorcode),
        });
        done();
      });
    });

    it('returns payment result with predefined status', done => {
      const request: IGooglePayGatewayRequest = {
        ...googlePayGatewayRequest,
        resultStatus: PaymentStatus.FAILURE,
      };

      googlePaymentMethod.start(request).subscribe(result => {
        expect(result).toEqual({
          status: PaymentStatus.FAILURE,
          data: paymentResponse,
          paymentMethodName: GooglePaymentMethodName,
        });
        done();
      });
    });

    it('starts the 3DS process with configured merchantUrl', () => {
      when(configProviderMock.getConfig()).thenReturn({
        [GooglePayConfigName]: {
          merchantUrl: 'https://merchant.url',
        } as IGooglePayConfig,
      });

      googlePaymentMethod.start(googlePayGatewayRequest).subscribe(() => {
        verify(requestProcessingServiceMock.process(googlePayGatewayRequest, 'https://merchant.url')).once();
      });
    });

    it('returns payment result with error status if processing service throws an error', done => {
      const someError = new Error();

      when(requestProcessingServiceMock.process(anything(), anything())).thenThrow(someError);

      googlePaymentMethod.start(googlePayGatewayRequest).subscribe({
        error: (error) => {
          expect(error).toBe(someError);
          done();
        },
      });
    });

    it('returns payment result with error status if processing service throws a response with errorcode != 0', done => {
      const errorResponse: IRequestTypeResponse = { ...paymentResponse, errorcode: '1234' };

      when(requestProcessingServiceMock.process(anything(), anything())).thenReturn(throwError(() => errorResponse));

      googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
        expect(result).toEqual({
          status: PaymentStatus.ERROR,
          data: errorResponse,
          paymentMethodName: GooglePaymentMethodName,
        });
        done();
      });
    });

    it('returns payment result with cancel status if payment is cancelled', done => {
      const cancelRsponse: IRequestTypeResponse = { ...paymentResponse, isCancelled: true };

      when(requestProcessingServiceMock.process(anything(), anything())).thenReturn(throwError(() => cancelRsponse));

      googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
        expect(result).toEqual({
          status: PaymentStatus.CANCEL,
          data: cancelRsponse,
          paymentMethodName: GooglePaymentMethodName,
        });
        done();
      });
    });
  });
});
