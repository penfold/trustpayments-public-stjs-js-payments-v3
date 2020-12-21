import { of, throwError } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { ApplePayClientErrorService } from '../../../../../client/integrations/apple-pay/apple-pay-client-error-service/ApplePayClientErrorService';
import { ApplePayClientErrorCode } from '../../../../../client/integrations/apple-pay/ApplePayClientErrorCode';
import { Payment } from '../../../shared/payment/Payment';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { IApplePaySession } from '../apple-pay-session-service/IApplePaySession';
import { IApplePayValidateMerchantRequest } from '../apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayWalletVerifyResponse } from '../apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { ApplePayPaymentService } from './ApplePayPaymentService';

describe('ApplePayPaymentService', () => {
  let applePayPaymentService: ApplePayPaymentService;
  let paymentMock: Payment;
  let applePayConfigServiceMock: ApplePayConfigService;
  let applePayClientErrorServiceMock: ApplePayClientErrorService;

  const appPayValidateMerchantRequestMock: IApplePayValidateMerchantRequest = {
    walletmerchantid: '',
    walletrequestdomain: '',
    walletsource: '',
    walletvalidationurl: ''
  };
  const walletVerifyResponseMock: IApplePayWalletVerifyResponse = {
    response: {
      customeroutput: '',
      errorcode: '',
      errormesage: '',
      requestid: '',
      requesttypedescription: '',
      transactionstartedtimestamp: '',
      walletsession: '',
      walletsource: 'APPLEPAY'
    }
  };

  beforeAll(() => {
    paymentMock = mock(Payment);
    applePayConfigServiceMock = mock(ApplePayConfigService);
    applePayClientErrorServiceMock = mock(ApplePayClientErrorService);

    applePayPaymentService = new ApplePayPaymentService(
      instance(paymentMock),
      instance(applePayConfigServiceMock),
      instance(applePayClientErrorServiceMock)
    );

    when(applePayConfigServiceMock.updateWalletValidationUrl(anything(), anything())).thenReturn();
  });

  describe('walletVerify()', () => {
    beforeAll(() => {
      when(paymentMock.walletVerify(anything())).thenReturn(of(walletVerifyResponseMock));
    });

    it('should return CANCEL when cancelled flag passed', done => {
      applePayPaymentService
        .walletVerify(appPayValidateMerchantRequestMock, '', true, {} as IApplePaySession)
        .subscribe(response => {
          expect(response).toEqual(ApplePayClientErrorCode.CANCEL);
          done();
        });
    });

    it(`should return ERROR when no wallet session data`, done => {
      applePayPaymentService
        .walletVerify(appPayValidateMerchantRequestMock, '', false, {} as IApplePaySession)
        .subscribe(response => {
          expect(response).toEqual(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
          done();
        });
    });

    it('should return ERROR when error on stream', done => {
      when(paymentMock.walletVerify(anything())).thenReturn(throwError('Err'));

      applePayPaymentService
        .walletVerify(appPayValidateMerchantRequestMock, '', false, {} as IApplePaySession)
        .subscribe(response => {
          expect(response).toEqual(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
          done();
        });
    });
  });
});
