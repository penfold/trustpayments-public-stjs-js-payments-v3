import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';
import { RequestType } from '../../../../../shared/types/RequestType';
import { IApplePayValidateMerchantRequest } from '../IApplePayValidateMerchantRequest';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { ApplePayConfigService } from './ApplePayConfigService';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { instance, mock, when } from 'ts-mockito';
import { ApplePayNetworksService } from '../apple-pay-networks-service/ApplePayNetworksService';

describe('ApplePayConfigService', () => {
  const paymentRequest: IApplePayPaymentRequest = {
    countryCode: 'de_DE',
    currencyCode: 'EUR',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'discover'],
    requestTypes: ['AUTH'],
    total: {
      amount: '10.00',
      label: 'test'
    }
  };
  let paymentRequestUpdated: IApplePayPaymentRequest;
  let currencyCode: string;
  let amount: string;
  let requestTypes: RequestType[];
  let validateMerchantRequest: IApplePayValidateMerchantRequest;
  let validateMerchantRequestUpdated: IApplePayValidateMerchantRequest;
  let walletMerchantId: string;
  let walletValidationUrl: string;
  let config: IConfig;
  const payload = {
    payload: {
      currencyiso3a: 'test iso',
      locale: 'en_GB',
      mainamount: 'test amount'
    }
  };
  const jwtDecoderMock: JwtDecoder = mock(JwtDecoder);
  const applePayNetworkService: ApplePayNetworksService = mock(ApplePayNetworksService);
  const jwt: string =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDcwOTA2NTEsImlzcyI6ImFtMDMxMC5hdXRvYXBpIiwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6InRlc3QgaXNvIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwibWFpbmFtb3VudCI6InRlc3QgYW1vdW50In19.Ni3igXSMvOIvrnAAaMh_BfiEfw6Mht1isTUDW9o7l_Q';
  let applePayConfigService: ApplePayConfigService = new ApplePayConfigService(
    instance(jwtDecoderMock),
    instance(applePayNetworkService)
  );

  describe('update paymentRequest object', () => {
    beforeAll(() => {
      currencyCode = 'PLN';
      amount = '22.00';
      requestTypes = ['ACCOUNTCHECK', 'AUTH'];
    });

    beforeEach(() => {
      paymentRequestUpdated = paymentRequest;
    });

    it(`should update paymentRequest object with indicated currency code`, () => {
      paymentRequestUpdated = {
        ...paymentRequest,
        currencyCode
      };
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
      expect(applePayConfigService.updateAmount(paymentRequest, amount)).toEqual(paymentRequestUpdated);
    });

    it(`should update paymentRequest object with indicated requestTypes`, () => {
      paymentRequestUpdated = {
        ...paymentRequest,
        requestTypes
      };
      expect(applePayConfigService.updateRequestTypes(paymentRequest, requestTypes)).toEqual(paymentRequestUpdated);
    });
  });

  describe('update validateMerchantRequest object', () => {
    beforeAll(() => {
      validateMerchantRequest = {
        walletmerchantid: 'some id',
        walletrequestdomain: 'some domain',
        walletsource: 'some source',
        walletvalidationurl: 'some url'
      };
      walletMerchantId = 'new id';
      walletValidationUrl = 'new url';
    });

    beforeEach(() => {
      validateMerchantRequestUpdated = validateMerchantRequest;
    });

    it(`should update paymentRequest object with indicated currency code`, () => {
      validateMerchantRequestUpdated = {
        ...validateMerchantRequest,
        walletmerchantid: walletMerchantId
      };
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
      when(jwtDecoderMock.decode(jwt)).thenReturn(payload);
    });

    it('should return currencyiso3a, locale and mainamount parameter ', () => {
      expect(applePayConfigService.getStJwtData(jwt)).toEqual(payload.payload);
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
          requestTypes,
          placement: 'test place'
        },
        panIcon: false,
        submitFields: ['pan']
      };
    });

    it('should return all necessary data for init apple pay', () => {
      expect(applePayConfigService.getConfigData(config)).toEqual({
        jwt: config.jwt,
        formId: config.formId,
        applePay: config.applePay
      });
    });
  });
});
