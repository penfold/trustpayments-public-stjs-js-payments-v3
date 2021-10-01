import { mock, instance, when, verify, anything, deepEqual, spy } from 'ts-mockito';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { MerchantValidationService } from './MerchantValidationService';
import { IApplePaySession } from '../../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySession';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { EMPTY, of, throwError } from 'rxjs';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { ApplePayClientStatus } from '../../../application/core/integrations/apple-pay/ApplePayClientStatus';

describe('MerchantValidationService', () => {
  let frameQueryingServiceMock: IFrameQueryingService;
  let googleAnalyticsMock: GoogleAnalytics;
  let applePaySessionMock: IApplePaySession;
  let applePaySession: IApplePaySession;
  let applePaySessionSpy: IApplePaySession;
  let merchantValidationService: MerchantValidationService;
  const validationUrl = 'https://validationurl';

  beforeEach(() => {
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    googleAnalyticsMock = mock(GoogleAnalytics);
    applePaySessionMock = mock<IApplePaySession>();
    applePaySession = instance(applePaySessionMock);
    applePaySessionSpy = spy(applePaySession);
    merchantValidationService = new MerchantValidationService(
      instance(frameQueryingServiceMock),
      instance(googleAnalyticsMock),
    );

    when(frameQueryingServiceMock.query(anything(), anything())).thenReturn(of(EMPTY));
  });

  describe('init()', () => {
    const validateMerchantRequest: IApplePayValidateMerchantRequest = {
      walletvalidationurl: 'walletvalidationurl',
      walletrequestdomain: 'walletrequestdomain',
      walletsource: 'walletsource',
      walletmerchantid: 'walletmerchantid',
    };

    const config: IApplePayConfigObject = {
      validateMerchantRequest,
      applePayConfig: null,
      formId: '',
      jwtFromConfig: '',
      applePayVersion: 1,
      paymentRequest: null,
      locale: 'en_GB',
    };

    const walletVerifyResponse: IApplePayWalletVerifyResponseBody = {
      errorcode: '0',
      jwt: '',
      requesttypedescription: 'WALLETVERIFY',
      walletsource: 'APPLEPAY',
      errormessage: '',
      transactionstartedtimestamp: '',
      requestid: '',
      customeroutput: '',
      walletsession: JSON.stringify({ foo: 'bar' }),
    };

    it('sends validate merchant query and completes validation with the walletsession form response', () => {
      when(frameQueryingServiceMock.query(anything(), CONTROL_FRAME_IFRAME)).thenReturn(of(walletVerifyResponse));

      merchantValidationService.init(applePaySession, config);

      applePaySession.onvalidatemerchant({ validationURL: validationUrl });

      verify(frameQueryingServiceMock.query(deepEqual({
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
        data: {
          walletvalidationurl: validationUrl,
          walletrequestdomain: 'walletrequestdomain',
          walletsource: 'walletsource',
          walletmerchantid: 'walletmerchantid',
        },
      }), CONTROL_FRAME_IFRAME)).once();

      verify(applePaySessionMock.completeMerchantValidation(deepEqual({ foo: 'bar' }))).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`, 'Apple Pay Merchant validation success')).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify success')).once();
    });

    it('sends validate merchant query and aborts session when response errorcode!=0', () => {
      const errorResponse = { ...walletVerifyResponse, errorcode: '123' };

      when(frameQueryingServiceMock.query(anything(), CONTROL_FRAME_IFRAME)).thenReturn(of(errorResponse));

      merchantValidationService.init(applePaySession, config);

      applePaySession.onvalidatemerchant({ validationURL: validationUrl });

      verify(applePaySessionMock.completeMerchantValidation(anything())).never();
      verify(applePaySessionMock.abort()).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`, 'Apple Pay Merchant validation error')).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify failure')).once();
    });

    it('sends validate merchant query and aborts session when verify request fails', () => {
      when(frameQueryingServiceMock.query(anything(), CONTROL_FRAME_IFRAME)).thenReturn(throwError(() => new Error()));

      merchantValidationService.init(applePaySession, config);

      applePaySession.onvalidatemerchant({ validationURL: validationUrl });

      verify(applePaySessionMock.completeMerchantValidation(anything())).never();
      verify(applePaySessionMock.abort()).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`, 'Apple Pay Merchant validation error')).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify failure')).once();
    });
  });
});
