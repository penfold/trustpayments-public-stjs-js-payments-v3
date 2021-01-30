import { first, tap } from 'rxjs/operators';
import { anything, instance as mockInstance, mock, when } from 'ts-mockito';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { Payment } from '../../../shared/payment/Payment';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { IApplePayWalletVerifyResponseBody } from '../apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { ApplePayPaymentService } from './ApplePayPaymentService';
import { IApplePayPayment } from '../apple-pay-payment-data/IApplePayPayment';
import { IApplePayPaymentMethod } from '../apple-pay-payment-data/IApplePayPaymentMethod';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';
import { from, of } from 'rxjs';
import { IApplePayWalletVerifyResponse } from '../apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { RequestType } from '../../../../../shared/types/RequestType';
import { any } from '@hapi/joi';
import { resolve } from 'promise-polyfill';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IApplePayClientStatus } from '../IApplePayClientStatus';
import { ApplePayClientStatus } from '../ApplePayClientStatus';

const jwt = '';
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
}

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
      when(applePayConfigService.updateWalletValidationUrl(anything(), anything())).thenReturn(config.validateMerchantRequest);
    })

    it('should verify wallet when payment is not cancelled', done => {
      const paymentCancelled = false;

      when(payment.walletVerify(anything())).thenReturn(of(walletVerifyResponse));

      applePayPaymentService.walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe((response: { status: ApplePayClientErrorCode; data: {} }) => {
            expect(response.data).toMatchObject(walletVerifyResponse.response);
            expect(response.status).toBe(ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS);
            done();
          }
        );
    });

    it('should not verify wallet when payment is cancelled', done => {
      const paymentCancelled = true;

      when(payment.walletVerify(anything())).thenReturn(of({}));

      applePayPaymentService.walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe((response: { status: ApplePayClientErrorCode; data: {} }) => {
            expect(response.data).toMatchObject({});
            expect(response.status).toBe(ApplePayClientErrorCode.CANCEL);
            done();
          }
        );
    });

    it('should not verify wallet when walletsession value is empty', done => {
      const paymentCancelled = false;

      when(payment.walletVerify(anything())).thenReturn(
        of({
          response: { ...walletVerifyResponse.response, walletsession: undefined }
        })
      );

      applePayPaymentService.walletVerify(config.validateMerchantRequest, validateMerchantURL, paymentCancelled)
        .subscribe((response: { status: ApplePayClientErrorCode; data: {} }) => {
            expect(response.data).toMatchObject({});
            expect(response.status).toBe(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
            done();
          }
        );
    });
  });

  describe('processPayment', () => {
    beforeEach(() => {
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
    });

    it.skip('should accept payment', done => {
      const data = { 
        response: { errorcode: '0' } 
      };

      when(payment.processPayment(anything(), anything(), anything(), anything())).thenResolve(data);

      applePayPaymentService.processPayment(
        [RequestType.AUTH, RequestType.THREEDQUERY],
        config.validateMerchantRequest,
        formData,
        mockedPayment
      ).subscribe((x: any ) => {
        expect(x.response).toMatchObject(data.response);
        done();
      });
    });

    it.skip('should declined payment when errorcode is not received', done => {
      const data = { response: {} };

      when(payment.processPayment(anything(), anything(), anything(), anything())).thenResolve(data);

      applePayPaymentService.processPayment(
        [RequestType.AUTH, RequestType.THREEDQUERY],
        config.validateMerchantRequest,
        formData,
        mockedPayment
      ).subscribe((x: any ) => {
        expect(x.errormessage).toBe('An error occured');
        expect(x.errormessage).toBe(ApplePayClientErrorCode.EMPTY_JWT_ERROR);
        done();
      });
    });
  });
});
