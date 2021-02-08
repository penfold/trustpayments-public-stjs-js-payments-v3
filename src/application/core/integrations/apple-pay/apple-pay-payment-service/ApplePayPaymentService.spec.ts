import { of } from 'rxjs';
import { anything, instance as mockInstance, mock, when } from 'ts-mockito';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { ApplePayClientStatus } from '../ApplePayClientStatus';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { ApplePayPaymentService } from './ApplePayPaymentService';
import { IApplePayClientStatus } from '../IApplePayClientStatus';
import { IApplePayPayment } from '../apple-pay-payment-data/IApplePayPayment';
import { IApplePayPaymentMethod } from '../apple-pay-payment-data/IApplePayPaymentMethod';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { Payment } from '../../../shared/payment/Payment';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { RequestType } from '../../../../../shared/types/RequestType';
import { IApplePayPaymentRequest } from '../apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';
import { IApplePayPaymentAuthorizationResult } from '../apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayClientStatusDetails } from '../IApplePayClientStatusDetails';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';

const formData = {};
const validateMerchantURL = 'some-url';
const config = {
  validateMerchantRequest: {
    walletmerchantid: 'id',
    walletrequestdomain: 'domain',
    walletsource: 'source',
    walletvalidationurl: 'url'
  }
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
    walletsource: 'APPLEPAY'
  }
};
const mockedPayment: IApplePayPayment = {
  token: {
    paymentMethod: {} as IApplePayPaymentMethod,
    transactionIdentifier: 'identiefier',
    paymentData: ''
  }
};

describe('ApplePayPaymentService', () => {
  let payment: Payment;
  let applePayConfigService: ApplePayConfigService;
  let messageBusMock: IMessageBus;
  let applePayPaymentService: ApplePayPaymentService;

  beforeEach(() => {
    payment = mock(Payment);
    applePayConfigService = mock(ApplePayConfigService);
    messageBusMock = mock<IMessageBus>();

    applePayPaymentService = new ApplePayPaymentService(
      mockInstance(payment),
      mockInstance(applePayConfigService),
      mockInstance(messageBusMock)
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
        .subscribe((response: { status: ApplePayClientErrorCode; data: {} }) => {
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
        .subscribe((response: { status: ApplePayClientErrorCode; data: {} }) => {
          expect(response.data).toMatchObject({});
          expect(response.status).toBe(ApplePayClientErrorCode.CANCEL);
          done();
        });
    });

    it('should not verify wallet when walletsession value is empty', done => {
      const paymentCancelled = false;

      when(payment.walletVerify(anything())).thenReturn(
        of({
          response: { ...walletVerifyResponse.response, walletsession: undefined }
        })
      );

      applePayPaymentService
        .walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe((response: { status: ApplePayClientErrorCode; data: {} }) => {
          expect(response.data).toMatchObject({});
          expect(response.status).toBe(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
          done();
        });
    });
  });

  describe('processPayment', () => {
    it('should accept payment', done => {
      const data = {
        response: { errorcode: 0 }
      };

      when(messageBusMock.pipe(anything(), anything(), anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            status: ApplePayClientStatus.SUCCESS,
            details: {
              errorCode: ApplePayClientErrorCode.SUCCESS,
              errorMessage: 'SUCCESS'
            }
          } as IApplePayClientStatus
        })
      );

      when(payment.processPayment(anything(), anything(), anything(), anything())).thenResolve(data);

      applePayPaymentService
        .processPayment(
          [RequestType.THREEDQUERY, RequestType.AUTH],
          config.validateMerchantRequest,
          formData,
          mockedPayment
        )
        .subscribe((response: any) => {
          expect(response.data.details.errorCode).toEqual(data.response.errorcode);
          done();
        });
    });

    it('should declined payment when errorcode is not received', done => {
      when(messageBusMock.pipe(anything(), anything(), anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            status: ApplePayClientStatus.EMPTY_JWT_ERROR,
            details: {
              errorCode: ApplePayClientErrorCode.EMPTY_JWT_ERROR,
              errorMessage: 'An error occured'
            }
          } as IApplePayClientStatus
        })
      );
      when(payment.processPayment(anything(), anything(), anything(), anything())).thenResolve({
        response: {
          errormessage: 'An error occured',
          errorcode: ApplePayClientErrorCode.EMPTY_JWT_ERROR
        }
      });

      applePayPaymentService
        .processPayment(
          [RequestType.THREEDQUERY, RequestType.AUTH],
          config.validateMerchantRequest,
          formData,
          mockedPayment
        )
        .subscribe((response: any) => {
          expect(response.data.details.errorCode).toBe(ApplePayClientErrorCode.EMPTY_JWT_ERROR);
          expect(response.data.details.errorMessage).toBe('An error occured');
          done();
        });
    });
  });
});
