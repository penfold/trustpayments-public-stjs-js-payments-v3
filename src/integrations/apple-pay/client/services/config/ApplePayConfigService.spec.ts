import { instance, mock, when } from 'ts-mockito';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { ApplePayNetworksService } from '../../models/apple-pay-networks-service/ApplePayNetworksService';
import { IApplePayPaymentRequest } from '../../models/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePayValidateMerchantRequest } from '../../models/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayConfig } from '../../models/IApplePayConfig';
import { IApplePaySessionWrapper } from '../../models/IApplePaySessionWrapper';
import { ApplePaySessionWrapper } from '../session/ApplePaySessionWrapper';
import { ApplePayConfigService } from './ApplePayConfigService';

describe('ApplePayConfigService', () => {
  const paymentRequest: IApplePayPaymentRequest = {
    countryCode: 'de_DE',
    currencyCode: 'EUR',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'discover'],
    total: {
      amount: '20.00',
      label: 'test',
    },
  };
  let config: IConfig;

  const validateMerchantRequest: IApplePayValidateMerchantRequest = {
    walletmerchantid: '',
    walletrequestdomain: '',
    walletsource: '',
    walletvalidationurl: '',
  };

  const applePayConfig: IApplePayConfig = {
    buttonStyle: 'white',
    buttonText: 'donate',
    merchantId: 'test-id',
    merchantUrl: 'https://example.com',
    paymentRequest: paymentRequest,
    placement: '',
  };
  const jwtDecoderMock: JwtDecoder = mock(JwtDecoder);
  const applePayNetworkService: ApplePayNetworksService = mock(ApplePayNetworksService);
  const applePaySessionService: IApplePaySessionWrapper = mock(ApplePaySessionWrapper);
  const jwt = 'somerandomjwt';
  const applePayConfigService: ApplePayConfigService = new ApplePayConfigService(
    instance(jwtDecoderMock),
    instance(applePayNetworkService),
    instance(applePaySessionService)
  );
  when(applePaySessionService.getLatestSupportedApplePayVersion()).thenReturn(5);

  describe('update paymentRequest object', () => {
    const currencyCode = 'PLN';
    const amount = '22.00';
    let paymentRequestUpdated: IApplePayPaymentRequest = paymentRequest;

    it('should update paymentRequest object with indicated currency code', () => {
      paymentRequestUpdated = {
        ...paymentRequest,
        currencyCode,
      };
      // @ts-ignore
      expect(applePayConfigService.updateCurrencyCode(paymentRequest, currencyCode)).toEqual(paymentRequestUpdated);
    });

    it('should update paymentRequest object with indicated amount', () => {
      paymentRequestUpdated = {
        ...paymentRequest,
        total: {
          ...paymentRequest.total,
          amount,
        },
      };
      // @ts-ignore
      expect(applePayConfigService.updateAmount(paymentRequest, amount)).toEqual(paymentRequestUpdated);
    });

    it('should update paymentRequest object with indicated requestTypes', () => {
      paymentRequestUpdated = {
        ...paymentRequest,
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
      walletvalidationurl: 'some url',
    };
    const walletMerchantId = 'new id';
    const walletValidationUrl = 'new url';
    let validateMerchantRequestUpdated: IApplePayValidateMerchantRequest = validateMerchantRequest;

    it('should update paymentRequest object with indicated currency code', () => {
      validateMerchantRequestUpdated = {
        ...validateMerchantRequest,
        walletmerchantid: walletMerchantId,
      };
      // @ts-ignore
      expect(applePayConfigService.updateWalletMerchantId(validateMerchantRequest, walletMerchantId)).toEqual(
        validateMerchantRequestUpdated
      );
    });

    it('should update paymentRequest object with indicated validation url', () => {
      validateMerchantRequestUpdated = {
        ...validateMerchantRequest,
        walletvalidationurl: walletValidationUrl,
      };
      expect(applePayConfigService.updateWalletValidationUrl(validateMerchantRequest, walletValidationUrl)).toEqual(
        validateMerchantRequestUpdated
      );
    });
  });

  describe('get properties from StJwt object', () => {
    it('should return currencyiso3a, locale and mainamount parameter when baseamount is provided', () => {
      const payload = {
        currencyiso3a: 'EUR',
        locale: 'en_GB',
        baseamount: '1000',
      };

      when(jwtDecoderMock.decode<typeof payload>(jwt)).thenReturn({ payload });

      expect(applePayConfigService.getStJwtData(jwt)).toEqual({
        currencyiso3a: payload.currencyiso3a,
        locale: payload.locale,
        mainamount: '10.00',
      });
    });

    it('should return currencyiso3a, locale and mainamount parameter when mainamount is provided', () => {
      const payload = {
        currencyiso3a: 'EUR',
        locale: 'en_GB',
        mainamount: '10.00',
      };

      when(jwtDecoderMock.decode<typeof payload>(jwt)).thenReturn({ payload });

      expect(applePayConfigService.getStJwtData(jwt)).toEqual({
        currencyiso3a: payload.currencyiso3a,
        locale: payload.locale,
        mainamount: '10.00',
      });
    });

    it('should throw an error when neither baseamount or mainamount are provided', () => {
      const payload = {
        currencyiso3a: 'EUR',
        locale: 'en_GB',
      }

      when(jwtDecoderMock.decode<typeof payload>(jwt)).thenReturn({ payload });

      expect(() => applePayConfigService.getStJwtData(jwt)).toThrowError();
    });

    it('should use mainamount when both mainamount and baseamount are provided', () => {
      const payload = {
        currencyiso3a: 'EUR',
        locale: 'en_GB',
        baseamount: '1000',
        mainamount: '20.00',
      };

      when(jwtDecoderMock.decode<typeof payload>(jwt)).thenReturn({ payload });

      expect(applePayConfigService.getStJwtData(jwt)).toEqual({
        currencyiso3a: payload.currencyiso3a,
        locale: payload.locale,
        mainamount: '20.00',
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
          merchantUrl: 'https://example.com',
          buttonStyle: 'white',
          buttonText: 'donate',
          paymentRequest,
          placement: 'test place',
        },
        panIcon: false,
        submitFields: ['pan'],
      };
    });

    it('should return all necessary data for init apple pay', () => {
      // @ts-ignore
      expect(applePayConfigService.getConfigData(config)).toEqual({
        jwt: config.jwt,
        formId: config.formId,
        applePay: config.applePay,
        merchantUrl: config.applePay.merchantUrl,
      });
    });
  });

  describe('get apple pay config object', () => {
    const config: IConfig = {
      applePay: applePayConfig,
      jwt,
      formId: 'st-form',
      animatedCard: true,
      panIcon: true,
      datacenterurl: '',
    };

    it('should return apple pay config object', () => {
      expect(applePayConfigService.getConfig(config, validateMerchantRequest)).toEqual({
        applePayConfig,
        applePayVersion: 5,
        locale: 'en_GB',
        merchantUrl: 'https://example.com',
        formId: 'st-form',
        jwtFromConfig: jwt,
        validateMerchantRequest: {
          walletmerchantid: 'test-id',
          walletrequestdomain: '',
          walletsource: '',
          walletvalidationurl: '',
        },
        paymentRequest,
      });
    });
  });
});

