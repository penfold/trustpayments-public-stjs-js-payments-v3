import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { ApplePayClientErrorCode } from '../../../../../client/integrations/apple-pay/ApplePayClientErrorCode';
import { Payment } from '../../../shared/payment/Payment';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { IApplePaySession } from '../apple-pay-session-service/IApplePaySession';
import { IApplePayValidateMerchantRequest } from '../apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayWalletVerifyResponse } from '../apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { ApplePayPaymentService } from './ApplePayPaymentService';

describe('ApplePayPaymentService', () => {
  let applePayPaymentService: ApplePayPaymentService;
  let applePayConfigServiceMock: ApplePayConfigService;
  let paymentMock: Payment;

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
    applePayConfigServiceMock = mock(ApplePayConfigService);
    paymentMock = mock(Payment);

    applePayPaymentService = new ApplePayPaymentService(instance(applePayConfigServiceMock), instance(paymentMock));

    when(applePayConfigServiceMock.updateWalletValidationUrl(anything(), anything())).thenReturn();
  });

  describe('walletVerify()', () => {
    it(`should return ${ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR} when no wallersession defined`, done => {
      when(paymentMock.walletVerify(anything())).thenReturn(of(walletVerifyResponseMock));

      applePayPaymentService
        .walletVerify(appPayValidateMerchantRequestMock, '', true, {} as IApplePaySession)
        .subscribe(response => {
          expect(response).toEqual(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
          done();
        });
    });
  });
});
