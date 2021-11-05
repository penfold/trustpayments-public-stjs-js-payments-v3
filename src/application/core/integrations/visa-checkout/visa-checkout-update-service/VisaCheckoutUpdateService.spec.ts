import { mock, instance as mockInstance, when, anything } from 'ts-mockito';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { environment } from '../../../../../environments/environment';
import { VisaCheckoutButtonProps } from '../visa-checkout-button-service/VisaCheckoutButtonProps';
import { VisaCheckoutUpdateService } from './VisaCheckoutUpdateService';

describe('VisaCheckoutUpdateService', () => {
  let instance: VisaCheckoutUpdateService;
  let jwtDecoderMock: JwtDecoder;

  const stJwt: IStJwtPayload = {
    currencyiso3a: 'PLN',
    locale: 'de_DE',
    mainamount: '100',
  };
  const config: IVisaCheckoutInitConfig = {
    apikey: 'some key',
    settings: {
      locale: 'en_GB',
    },
    referenceCallID: 'test ref id',
    externalProfileId: 'test profile id',
    externalClientId: 'test client id',
    paymentRequest: {
      currencyCode: 'GPB',
      total: '11',
      subtotal: '2',
    },
  };

  const updatedConfig: IVisaCheckoutInitConfig = {
    apikey: 'some key',
    settings: {
      locale: 'de_DE',
    },
    referenceCallID: 'test ref id',
    externalProfileId: 'test profile id',
    externalClientId: 'test client id',
    paymentRequest: {
      currencyCode: 'PLN',
      total: '100',
      subtotal: '100',
    },
  };

  beforeEach(() => {
    const payload = {
      payload: {
        currencyiso3a: 'EUR',
        locale: 'en_GB',
        baseamount: '1000',
        mainamount: '10.00',
      },
    };
    jwtDecoderMock = mock(JwtDecoder);
    when(jwtDecoderMock.decode(anything())).thenReturn(payload);

    instance = new VisaCheckoutUpdateService(mockInstance(jwtDecoderMock));
  });

  it('should set updated config with certain values', () => {
    expect(instance.updateVisaInit(stJwt, config)).toEqual(updatedConfig);
  });

  it('should set config object', () => {
    expect(
      instance.updateConfigObject({
        jwt:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw',
        visaCheckout: {
          buttonSettings: {
            size: 154,
            color: 'neutral',
          },
          livestatus: 0,
          merchantId: 'some id',
          paymentRequest: {
            subtotal: '20.00',
          },
          placement: 'st-visa-checkout',
          settings: {
            displayName: 'My Test Site',
          },
        },
      }).visaInitConfig,
    ).toEqual({
      apikey: 'some id',
      encryptionKey: undefined,
      paymentRequest: {
        currencyCode: 'EUR',
        subtotal: '20.00',
        total: '10.00',
      },
      settings: {
        displayName: 'My Test Site',
        locale: 'en_GB',
      },
    });
  });

  it('should set developer mode config object with specified merchantUrl and sdk urls', () => {
    expect(
      instance.updateConfigObject({
        jwt:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw',
        visaCheckout: {
          merchantUrl: 'https://somemerchanturl.com',
          livestatus: 0,
          merchantId: 'some id',
          placement: 'st-visa-checkout',
        },
      }),
    ).toEqual({
      buttonUrl: VisaCheckoutButtonProps.src,
      merchantUrl: 'https://somemerchanturl.com',
      sdkUrl: environment.VISA_CHECKOUT_URLS.TEST_SDK,
      visaInitConfig: {
        apikey: 'some id',
        encryptionKey: undefined,
        paymentRequest: {
          currencyCode: 'EUR',
          subtotal: '10.00',
          total: '10.00',
        },
        settings: {
          locale: 'en_GB',
        },
      },
    });
  });

  it('should set production mode config object with specified merchantUrl and sdk urls', () => {
    expect(
      instance.updateConfigObject({
        jwt:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw',
        visaCheckout: {
          merchantUrl: 'https://somemerchanturl.com',
          livestatus: 1,
          merchantId: 'some id',
          placement: 'st-visa-checkout',
        },
      }),
    ).toEqual({
      buttonUrl: VisaCheckoutButtonProps.src,
      sdkUrl: environment.VISA_CHECKOUT_URLS.TEST_SDK,
      merchantUrl: 'https://somemerchanturl.com',
      visaInitConfig: {
        apikey: 'some id',
        encryptionKey: undefined,
        paymentRequest: {
          currencyCode: 'EUR',
          subtotal: '10.00',
          total: '10.00',
        },
        settings: {
          locale: 'en_GB',
        },
      },
    });
  });

  it('should throw an error when visa checkout config has not been specified', () => {
    expect(() => instance.updateConfigObject({ jwt: 'some jwt' })).toThrowError(
      'VisaCheckout config has not been specified',
    );
  });
});
