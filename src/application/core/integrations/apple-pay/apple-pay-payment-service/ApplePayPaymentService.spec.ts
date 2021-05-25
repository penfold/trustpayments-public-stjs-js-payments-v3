import { EMPTY, of } from 'rxjs';
import { anything, instance as mockInstance, mock, when } from 'ts-mockito';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { ApplePayClientStatus } from '../ApplePayClientStatus';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { ApplePayPaymentService } from './ApplePayPaymentService';
import { IApplePayPayment } from '../apple-pay-payment-data/IApplePayPayment';
import { IApplePayPaymentMethod } from '../apple-pay-payment-data/IApplePayPaymentMethod';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { Payment } from '../../../shared/payment/Payment';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { RequestType } from '../../../../../shared/types/RequestType';
import { SimpleMessageBus } from '../../../shared/message-bus/SimpleMessageBus';
import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';
import { IApplePayWalletVerifyResponseBody } from '../apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';

const formData = {};
const validateMerchantURL = 'some-url';

const config = {
  validateMerchantRequest: {
    walletmerchantid: 'id',
    walletrequestdomain: 'domain',
    walletsource: 'source',
    walletvalidationurl: 'url',
  },
};

const walletVerifyResponse = {
  response: {
    customeroutput: 'customeroutput',
    errorcode: '0',
    errormessage: '',
    requestid: 'id',
    requesttypedescription: 'description',
    transactionstartedtimestamp: 'timestamp',
    walletsession: 'session',
    walletsource: 'APPLEPAY',
  },
};

const mockedPayment: IApplePayPayment = {
  token: {
    paymentMethod: {} as IApplePayPaymentMethod,
    transactionIdentifier: 'identiefier',
    paymentData: '',
  },
};

const bypassResponseErrorData = {
  errormessage: 'Bypass',
  errorcode: '22000',
};

const invalidResponseErrorData = {
  errormessage: 'Invalid response',
  errorcode: '50003',
};

describe('ApplePayPaymentService', () => {
  let payment: Payment;
  let applePayConfigService: ApplePayConfigService;
  let messageBus: IMessageBus;
  let applePayPaymentService: ApplePayPaymentService;

  beforeEach(() => {
    payment = mock(Payment);
    applePayConfigService = mock(ApplePayConfigService);
    messageBus = new SimpleMessageBus();

    applePayPaymentService = new ApplePayPaymentService(
      mockInstance(payment),
      mockInstance(applePayConfigService),
      messageBus
    );
  });

  describe('walletVerify', () => {
    beforeEach(() => {
      when(applePayConfigService.updateWalletValidationUrl(anything(), anything())).thenReturn(
        config.validateMerchantRequest
      );
    });

    it('should verify wallet when payment is not cancelled', done => {
      const paymentCancelled = false;

      when(payment.walletVerify(anything())).thenReturn(of(walletVerifyResponse));

      applePayPaymentService
        .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe((response: { status: ApplePayClientErrorCode; data: IApplePayWalletVerifyResponseBody }) => {
          expect(response.data).toMatchObject(walletVerifyResponse.response);
          expect(response.status).toBe(ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS);
          done();
        });
    });

    it('should not verify wallet when payment is cancelled', done => {
      const paymentCancelled = true;

      when(payment.walletVerify(anything())).thenReturn(of({}));

      applePayPaymentService
        .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe((response: { status: ApplePayClientErrorCode; data: IApplePayWalletVerifyResponseBody }) => {
          expect(response.data).toMatchObject({});
          expect(response.status).toBe(ApplePayClientErrorCode.CANCEL);
          done();
        });
    });

    it('should not verify wallet when walletsession value is empty', done => {
      const paymentCancelled = false;

      when(payment.walletVerify(anything())).thenReturn(
        of({
          response: { ...walletVerifyResponse.response, walletsession: undefined },
        })
      );

      applePayPaymentService
        .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe((response: { status: ApplePayClientErrorCode; data: IApplePayWalletVerifyResponseBody }) => {
          expect(response.data).toMatchObject({});
          expect(response.status).toBe(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
          done();
        });
    });

    it('should check if TRANSACTION_COMPLETE event is captured during walletverify process', done => {
      const paymentCancelled = false;
      when(payment.walletVerify(anything())).thenReturn(EMPTY);

      applePayPaymentService
        .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe(
          (response: { status: ApplePayClientErrorCode; data: { errorcode: string; errormessage: string } }) => {
            expect(response.data.errormessage).toEqual('An error occured');
            expect(response.data.errorcode).toEqual(String(ApplePayClientErrorCode.ERROR));
            done();
          }
        );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errormessage: 'An error occured',
            errorcode: String(ApplePayClientErrorCode.ERROR),
          },
        },
        true
      );
    });
  });

  describe('processPayment', () => {
    it('should proceed payment when error code is equal 0', done => {
      const data = {
        response: { errorcode: '0' },
      };

      when(payment.processPayment(anything(), anything(), anything(), anything(), anything())).thenResolve(data);

      applePayPaymentService
        .processPayment(
          [RequestType.THREEDQUERY, RequestType.AUTH],
          config.validateMerchantRequest,
          formData,
          mockedPayment
        )
        .subscribe((response: IApplePayProcessPaymentResponse) => {
          expect(response.errorcode).toEqual(data.response.errorcode);
          done();
        });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            status: ApplePayClientStatus.SUCCESS,
            details: {
              errorCode: ApplePayClientErrorCode.SUCCESS,
              errorMessage: 'SUCCESS',
            },
          },
        },
        true
      );
    });

    it('should declined payment when errorcode is not received', done => {
      when(payment.processPayment(anything(), anything(), anything(), anything(), anything())).thenResolve({
        response: {
          errorcode: undefined,
          errormessage: 'An error occured',
        },
      });

      applePayPaymentService
        .processPayment(
          [RequestType.THREEDQUERY, RequestType.AUTH],
          config.validateMerchantRequest,
          formData,
          mockedPayment
        )
        .subscribe((response: IApplePayProcessPaymentResponse) => {
          expect(response.errorcode).toBe(ApplePayClientErrorCode.EMPTY_JWT_ERROR);
          expect(response.errormessage).toBe('An error occured');
          done();
        });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            status: ApplePayClientStatus.ERROR,
            details: {
              errorcode: undefined,
              errormessage: 'An error occured',
            },
          },
        },
        true
      );
    });

    it(`should return error data when TRANSACTION_COMPLETE event returns ${bypassResponseErrorData.errormessage} error number ${bypassResponseErrorData.errorcode}`, done => {
      when(payment.processPayment(anything(), anything(), anything(), anything(), anything())).thenReturn(
        new Promise(() => {})
      );

      applePayPaymentService
        .processPayment(anything(), anything(), anything(), anything(), anything())
        .subscribe((response: IApplePayProcessPaymentResponse) => {
          expect(response).toEqual(bypassResponseErrorData);
          done();
        });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: bypassResponseErrorData,
        },
        true
      );
    });

    it(`should return error data when TRANSACTION_COMPLETE event returns ${invalidResponseErrorData.errormessage} error number ${invalidResponseErrorData.errorcode}`, done => {
      when(payment.processPayment(anything(), anything(), anything(), anything(), anything())).thenReturn(
        new Promise(() => {})
      );

      applePayPaymentService
        .processPayment(anything(), anything(), anything(), anything(), anything())
        .subscribe((response: IApplePayProcessPaymentResponse) => {
          expect(response).toEqual(invalidResponseErrorData);
          done();
        });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: invalidResponseErrorData,
        },
        true
      );
    });
  });
});
