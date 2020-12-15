import 'reflect-metadata';
import { ApplePayMock } from '../../application/core/integrations/apple-pay/ApplePayMock';
import { StCodec } from '../../application/core/services/st-codec/StCodec.class';
import { ApplePay } from '../../application/core/integrations/apple-pay/ApplePay';
import { environment } from '../../environments/environment';
import ST from './ST';
import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../../testing/mocks/TestConfigProvider';

window.alert = jest.fn();
jest.mock('./../../application/core/shared/dom-methods/DomMethods');
jest.mock('./../../client/common-frames/CommonFrames.class');
jest.mock('./../../client/card-frames/CardFrames.class');
jest.mock('./../../application/core/integrations/visa-checkout/VisaCheckout');
jest.mock('./../../application/core/integrations/apple-pay/ApplePay');
jest.mock('./../../application/core/integrations/google-analytics/GoogleAnalytics');

Container.set({ id: ConfigProvider, type: TestConfigProvider });

describe('ST', () => {
  const { config, cacheConfig, instance } = stFixture();

  describe('constructor()', () => {
    let stObject: any;

    beforeEach(() => {
      instance.Init = jest.fn();
      // @ts-ignore
      stObject = ST(cacheConfig);
    });
  });

  describe('updateJWT()', () => {
    const lodash = jest.requireActual('lodash');

    beforeEach(() => {
      StCodec.updateJWTValue = jest.fn();
      instance.updateJWT('somenewjwtvalue');
      lodash.debounce = jest.fn().mockImplementationOnce(() => {
        StCodec.updateJWTValue('somenewjwtvalue');
      });
    });

    it('should assign new jwt value', () => {
      expect(instance._config.jwt).toEqual('somenewjwtvalue');
    });

    it('should call updateJWTValue', () => {
      expect(StCodec.updateJWTValue).toHaveBeenCalled();
    });

    it('should throw an error if newJwt is not specified', () => {
      expect(() => {
        instance.updateJWT(null);
      }).toThrow();
    });
  });

  describe('cbrt', () => {
    const key: string = 'some random key';
    beforeEach(() => {
      instance._cybertonica.getTransactionId = jest.fn().mockReturnValueOnce(key);
    });

    it('should return transaction id when standalone cybertonica function has been called', async () => {
      expect(await instance.Cybertonica()).toEqual(key);
    });
  });
});

function stFixture() {
  document.body.innerHTML =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  const translations = {
    Timeout: 'Limit czasu',
    'Field is required': 'Pole jest wymagane',
    'An error occurred': 'Wystąpił błąd',
    'Merchant validation failure': 'Błąd weryfikacji sprzedawcy',
    'Payment has been cancelled': 'Płatność została anulowana',
    'Value mismatch pattern': 'Błędny format',
    'Invalid response': 'Niepoprawna odpowiedź',
    'Invalid request': 'Nieprawidłowe żądanie',
    'Value is too short': 'Wartość jest za krótka',
    'Payment has been authorized': 'Płatność została autoryzowana',
    'Amount and currency are not set': 'Kwota i waluta nie są ustawione',
    'Payment has been successfully processed': 'Płatność została pomyślnie przetworzona',
    'Card number': 'Numer karty',
    'Expiration date': 'Data ważności',
    'Security code': 'Kod bezpieczeństwa',
    Ok: 'Płatność została pomyślnie przetworzona',
    'Method not implemented': 'Metoda nie została zaimplementowana',
    'Form is not valid': 'Formularz jest nieprawidłowy',
    Pay: 'Zapłać',
    Processing: 'Przetwarzanie',
    'Invalid field': 'Nieprawidłowe pole',
    'Card number is invalid': 'Numer karty jest nieprawidłowy'
  };
  const config = {
    analytics: true,
    animatedCard: true,
    components: { defaultPaymentType: 'test', paymentTypes: ['test'] },
    init: {
      threedinit: 'test',
      cachetoken: 'test'
    },
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU2MDk0NjM4Ny4yNDIzMzQ0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiNDExMTExMTExMTExMTExMSIsImV4cGlyeWRhdGUiOiIwMS8yMCIsInNlY3VyaXR5Y29kZSI6IjEyMyJ9fQ.UssdRcocpaeAqd-jDXpxWeWiKIX-W7zlpy0UWrDE5vg', // Can't use property shorthand because it isn't supported by IE
    livestatus: 0,
    disableNotification: false,
    cybertonicaApiKey: 'stfs',
    origin: 'https://someorigin.com',
    styles: {
      cardNumber: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      expirationDate: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      securityCode: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      }
    },
    submitOnError: false,
    submitOnSuccess: false,
    translations: { ...translations },
    buttonId: 'merchant-submit-button'
  };

  const cacheConfig = {
    animatedCard: true,
    jwt: config.jwt,
    init: {
      threedinit:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJSZWZlcmVuY2VJZCI6IjQyLWYzYThjNDk0YWNkYzY2MDcyOTc4YzY0ODg4ZWY5Mjk4ZDE4YWE1ZDRkMzUwNjBmZTQzNmFmN2M1YzI1NDVhM2QiLCJpc3MiOiI1YzEyODg0NWMxMWI5MjIwZGMwNDZlOGUiLCJqdGkiOiI0Mi1mM2E4YzQ5NGFjZGM2NjA3Mjk3OGM2NDg4OGVmOTI5OGQxOGFhNWQ0ZDM1MDYwZmU0MzZhZjdjNWMyNTQ1YTNkIiwiaWF0IjoxNTYxNzI2ODA5LCJQYXlsb2FkIjp7Ik9yZGVyRGV0YWlscyI6eyJBbW91bnQiOjEwMDAsIkN1cnJlbmN5Q29kZSI6IjgyNiJ9fSwiT3JnVW5pdElkIjoiNWMxMTNlOGU2ZmUzZDEyNDYwMTQxODY4In0.GIpwP_MWbocwOkexF_AE1Bo0LuIYsXWFcKWog4EaygA',
      cachetoken:
        'eyJkYXRhY2VudGVydXJsIjogbnVsbCwgImNhY2hldG9rZW4iOiAiNDItZjNhOGM0OTRhY2RjNjYwNzI5NzhjNjQ4ODhlZjkyOThkMThhYTVkNGQzNTA2MGZlNDM2YWY3YzVjMjU0NWEzZCJ9'
    },
    disableNotification: false,
    livestatus: 0,
    origin: 'https://someorigin.com',
    styles: config.styles,
    submitOnError: false,
    submitOnSuccess: false,
    datacenterurl: 'https://example.com',
    formId: 'example-form',
    translations: { ...translations }
  };
  const applePayConfig = {
    buttonStyle: 'white-outline',
    buttonText: 'donate',
    merchantId: 'merchant.net.securetrading',
    paymentRequest: {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
      total: {
        label: 'Secure Trading Merchant',
        amount: '10.00'
      }
    },
    placement: 'st-apple-pay'
  };

  const visaCheckoutConfig = {
    buttonSettings: {
      size: '154',
      color: 'neutral'
    },
    merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
    paymentRequest: {
      subtotal: '20.00'
    },
    placement: 'st-visa-checkout',
    settings: {
      displayName: 'My Test Site'
    }
  };
  // @ts-ignore
  const instance: any = ST(config);
  return { cacheConfig, config, instance, applePayConfig, visaCheckoutConfig };
}
