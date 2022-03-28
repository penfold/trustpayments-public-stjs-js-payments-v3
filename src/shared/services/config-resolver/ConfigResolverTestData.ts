import { LoggingLevel, ChallengeDisplayMode, ProcessingScreenMode } from '@trustpayments/3ds-sdk-js';
import { IConfig } from '../../model/config/IConfig';
import { threeDSecureConfigName } from '../../../application/core/services/three-d-verification/implementations/trust-payments/IThreeDSecure';
import { GooglePayConfigName } from '../../../integrations/google-pay/models/IGooglePayConfig';
import { TokenizedCardPaymentConfigName } from '../../../integrations/tokenized-card/models/ITokenizedCardPaymentMethod';

export const config: IConfig = {
  analytics: true,
  animatedCard: true,
  applePay: {
    buttonStyle: 'white-outline',
    buttonText: 'donate',
    merchantId: 'merchant.net.securetrading.test',
    merchantUrl: 'https://example.com',
    paymentRequest: {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
      supportedNetworks: [],
      total: {
        label: 'Secure Trading Merchant',
        amount: '10.00',
      },
    },
    placement: 'st-apple-pay',
  },
  buttonId: 'merchant-submit-button',
  componentIds: {
    animatedCard: '',
    cardNumber: '',
    expirationDate: '',
    notificationFrame: '',
    securityCode: '',
  },
  components: {
    defaultPaymentType: '',
    paymentTypes: [],
    startOnLoad: false,
  },
  cybertonicaApiKey: '',
  datacenterurl: '',
  deferInit: false,
  disableNotification: false,
  errorReporting: true,
  fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
  formId: 'st-form',
  init: {
    cachetoken: '',
    threedinit: '',
  },
  jwt:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU4NTkxNDEzOS4wOTc5MjA3LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIn19.7mz-INqaGWutOvSO16WLuJFSCtJQkVPz_2hvQ6tbisc',
  livestatus: 0,
  origin: '',
  placeholders: {
    pan: 'Card number',
    expirydate: 'MM/YY',
    securitycode: '***',
  },
  panIcon: true,
  styles: {
    defaultStyles: {
      'background-color-input': 'AliceBlue',
    },
    cardNumber: {
      'font-size-input': '1.5rem',
      'line-height-input': '1.6rem',
    },
    expirationDate: {
      'font-size-input': '1.5rem',
      'line-height-input': '1.6rem',
    },
    securityCode: {
      'font-size-input': '1.5rem',
      'line-height-input': '1.6rem',
    },
    notificationFrame: {
      'color-error': '#FFF333',
    },
    controlFrame: {
      'color-error': '#3358FF',
    },
  },
  submitFields: [],
  submitOnSuccess: false,
  submitOnError: false,
  submitCallback: null,
  translations: {
    'An error occurred': 'Wystąpił błąd',
  },
  visaCheckout: {
    buttonSettings: {
      size: 154,
      color: 'neutral',
    },
    livestatus: 0,
    merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
    merchantUrl: 'https://example.com',
    paymentRequest: {
      subtotal: '20.0',
    },
    placement: 'st-visa-checkout',
    settings: {
      displayName: 'My Test Site',
    },
  },
  [TokenizedCardPaymentConfigName]: undefined,
  [threeDSecureConfigName]: {
    loggingLevel: undefined,
    challengeDisplayMode: undefined,
  },
};
export const configResolved: IConfig = {
  analytics: true,
  animatedCard: true,
  stopSubmitFormOnEnter: false,
  applePay: {
    buttonStyle: 'white-outline',
    buttonText: 'donate',
    merchantUrl: 'https://example.com',
    merchantId: 'merchant.net.securetrading.test',
    paymentRequest: {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
      supportedNetworks: [],
      total: {
        label: 'Secure Trading Merchant',
        amount: '10.00',
      },
    },
    placement: 'st-apple-pay',
  },
  buttonId: 'merchant-submit-button',
  cancelCallback: null,
  componentIds: {
    animatedCard: 'st-animated-card',
    cardNumber: 'st-card-number',
    expirationDate: 'st-expiration-date',
    notificationFrame: 'st-notification-frame',
    securityCode: 'st-security-code',
  },
  components: {
    defaultPaymentType: '',
    paymentTypes: [''],
    startOnLoad: false,
  },
  cybertonicaApiKey: '',
  datacenterurl: 'https://webservices.securetrading.net/jwt/',
  deferInit: false,
  disableNotification: false,
  errorCallback: null,
  errorReporting: true,
  fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
  formId: 'st-form',
  init: {
    cachetoken: '',
    threedinit: '',
  },
  jwt:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU4NTkxNDEzOS4wOTc5MjA3LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIn19.7mz-INqaGWutOvSO16WLuJFSCtJQkVPz_2hvQ6tbisc',
  livestatus: 0,
  origin: 'http://localhost',
  placeholders: {
    pan: 'Card number',
    expirydate: 'MM/YY',
    securitycode: '***',
  },
  panIcon: true,
  styles: {
    defaultStyles: {
      'background-color-input': 'AliceBlue',
    },
    cardNumber: {
      'font-size-input': '1.5rem',
      'line-height-input': '1.6rem',
    },
    expirationDate: {
      'font-size-input': '1.5rem',
      'line-height-input': '1.6rem',
    },
    securityCode: {
      'font-size-input': '1.5rem',
      'line-height-input': '1.6rem',
    },
    notificationFrame: {
      'color-error': '#FFF333',
    },
    controlFrame: {
      'color-error': '#3358FF',
    },
  },
  submitFields: [
    'baseamount',
    'currencyiso3a',
    'eci',
    'enrolled',
    'errorcode',
    'errordata',
    'errormessage',
    'orderreference',
    'settlestatus',
    'status',
    'transactionreference',
  ],
  submitOnCancel: false,
  submitOnSuccess: false,
  submitOnError: false,
  submitCallback: null,
  successCallback: null,
  translations: {
    'An error occurred': 'Wystąpił błąd',
  },
  visaCheckout: {
    buttonSettings: {
      size: 154,
      color: 'neutral',
    },
    livestatus: 0,
    merchantUrl: 'https://example.com',
    merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
    paymentRequest: {
      subtotal: '20.0',
    },
    placement: 'st-visa-checkout',
    settings: {
      displayName: 'My Test Site',
    },
  },
  [GooglePayConfigName]: undefined,
  [TokenizedCardPaymentConfigName]: undefined,
  [threeDSecureConfigName]: {
    loggingLevel: LoggingLevel.ERROR,
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
    translations: {},
    processingScreenMode: ProcessingScreenMode.OVERLAY,
  },
};
export const minimalConfig: IConfig = {
  jwt: 'randomjwt',
};
export const minimalDefaultConfigResolve: IConfig = {
  analytics: false,
  animatedCard: false,
  applePay: undefined,
  buttonId: '',
  stopSubmitFormOnEnter: false,
  cancelCallback: null,
  componentIds: {
    animatedCard: 'st-animated-card',
    cardNumber: 'st-card-number',
    expirationDate: 'st-expiration-date',
    notificationFrame: 'st-notification-frame',
    securityCode: 'st-security-code',
  },
  components: {
    defaultPaymentType: '',
    paymentTypes: [''],
    startOnLoad: false,
  },
  cybertonicaApiKey: 'stfs',
  datacenterurl: 'https://webservices.securetrading.net/jwt/',
  deferInit: false,
  disableNotification: false,
  errorCallback: null,
  errorReporting: true,
  fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
  formId: 'st-form',
  [TokenizedCardPaymentConfigName]: undefined,
  [GooglePayConfigName]: undefined,
  init: {
    cachetoken: '',
    threedinit: '',
  },
  jwt: 'randomjwt',
  livestatus: 0,
  origin: 'http://localhost',
  placeholders: {
    pan: '**** **** **** ****',
    expirydate: 'MM/YY',
    securitycode: '***',
  },
  panIcon: false,
  styles: {},
  submitFields: [
    'baseamount',
    'currencyiso3a',
    'eci',
    'enrolled',
    'errorcode',
    'errordata',
    'errormessage',
    'orderreference',
    'settlestatus',
    'status',
    'transactionreference',
  ],
  submitOnCancel: false,
  submitOnSuccess: true,
  submitOnError: false,
  submitCallback: null,
  successCallback: null,
  translations: {},
  visaCheckout: undefined,
  threeDSecure: {
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
    loggingLevel: LoggingLevel.ERROR,
    translations: {},
    processingScreenMode: ProcessingScreenMode.OVERLAY,
  },
};
export const configWithWarning : IConfig = {
  jwt: 'randomjwt',
  init: {
    cachetoken: 'testest',
    threedinit: 'testest',
  },
};
