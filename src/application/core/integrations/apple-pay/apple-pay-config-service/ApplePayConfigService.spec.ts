import { anything, instance, mock, when } from 'ts-mockito';
import { IApplePayPaymentRequest } from '../apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePayValidateMerchantRequest } from '../apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { RequestType } from '../../../../../shared/types/RequestType';
import { ApplePayConfigService } from './ApplePayConfigService';
import { ApplePayNetworksService } from '../apple-pay-networks-service/ApplePayNetworksService';
import { ApplePaySessionService } from '../apple-pay-session-service/ApplePaySessionService';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';

describe('ApplePayConfigService', () => {
  const paymentRequest: IApplePayPaymentRequest = {
    countryCode: 'de_DE',
    currencyCode: 'EUR',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'discover'],
    total: {
      amount: '10.00',
      label: 'test'
    }
  };
  let requestTypes: RequestType[];
  let config: IConfig;
  const payload = {
    payload: {
      currencyiso3a: 'EUR',
      locale: 'en_GB',
      baseamount: '1000',
      mainamount: '10.00'
    }
  };
  const jwtDecoderMock: JwtDecoder = mock(JwtDecoder);
  const applePayNetworkService: ApplePayNetworksService = mock(ApplePayNetworksService);
  const applePaySessionService: ApplePaySessionService = mock(ApplePaySessionService);
  const jwt: string = 'somerandomjwt';
  let applePayConfigService: ApplePayConfigService = new ApplePayConfigService(
    instance(jwtDecoderMock),
    instance(applePayNetworkService),
    instance(applePaySessionService)
  );

  describe('update paymentRequest object', () => {
    const currencyCode: string = 'PLN';
    const amount: string = '22.00';
    const requestTypes: RequestType[] = ['ACCOUNTCHECK', 'AUTH'];
    let paymentRequestUpdated: IApplePayPaymentRequest = paymentRequest;

    it(`should update paymentRequest object with indicated currency code`, () => {
      paymentRequestUpdated = {
        ...paymentRequest,
        currencyCode
      };
      // @ts-ignore
      expect(applePayConfigService.updateCurrencyCode(paymentRequest, currencyCode)).toEqual(paymentRequestUpdated);
    });

    it(`should update paymentRequest object with indicated amount`, () => {
      paymentRequestUpdated = {
        ...paymentRequest,
        total: {
          ...paymentRequest.total,
          amount
        }
      };
      // @ts-ignore
      expect(applePayConfigService.updateAmount(paymentRequest, amount)).toEqual(paymentRequestUpdated);
    });

    it(`should update paymentRequest object with indicated requestTypes`, () => {
      paymentRequestUpdated = {
        ...paymentRequest
      };
      // @ts-ignore
      expect(applePayConfigService.updateRequestTypes(paymentRequest)).toEqual(paymentRequestUpdated);
    });
  });

  describe('update validateMerchantRequest object', () => {
    const validateMerchantRequest: IApplePayValidateMerchantRequest = {
      walletmerchantid: 'some id',
      walletrequestdomain: 'some domain',
      walletsource: 'some source',
      walletvalidationurl: 'some url'
    };
    const walletMerchantId: string = 'new id';
    const walletValidationUrl: string = 'new url';
    let validateMerchantRequestUpdated: IApplePayValidateMerchantRequest = validateMerchantRequest;

    it(`should update paymentRequest object with indicated currency code`, () => {
      validateMerchantRequestUpdated = {
        ...validateMerchantRequest,
        walletmerchantid: walletMerchantId
      };
      // @ts-ignore
      expect(applePayConfigService.updateWalletMerchantId(validateMerchantRequest, walletMerchantId)).toEqual(
        validateMerchantRequestUpdated
      );
    });

    it(`should update paymentRequest object with indicated currency code`, () => {
      validateMerchantRequestUpdated = {
        ...validateMerchantRequest,
        walletvalidationurl: walletValidationUrl
      };
      expect(applePayConfigService.updateWalletValidationUrl(validateMerchantRequest, walletValidationUrl)).toEqual(
        validateMerchantRequestUpdated
      );
    });
  });

  describe('get properties from StJwt object', () => {
    beforeAll(() => {
      when(jwtDecoderMock.decode(anything())).thenReturn(payload);
    });

    it('should return currencyiso3a, locale and mainamount parameter ', () => {
      // @ts-ignore
      expect(applePayConfigService.getStJwtData(jwt)).toEqual({
        currencyiso3a: payload.payload.currencyiso3a,
        locale: payload.payload.locale,
        mainamount: '10.00'
      });
    });
  });

  describe('get config data for init apple pay', () => {
    beforeAll(() => {
      config = {
        analytics: true,
        animatedCard: false,
        disableNotification: true,
        jwt: 'test jwt',
        formId: 'test id',
        applePay: {
          merchantId: 'test string',
          buttonStyle: 'some style',
          buttonText: 'test text',
          paymentRequest,
          placement: 'test place'
        },
        panIcon: false,
        submitFields: ['pan']
      };
    });

    it('should return all necessary data for init apple pay', () => {
      // @ts-ignore
      expect(applePayConfigService.getConfigData(config)).toEqual({
        jwt: config.jwt,
        formId: config.formId,
        applePay: config.applePay
      });
    });
  });
});
