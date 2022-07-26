declare const FRAME_URL: string | undefined;

// TODO should be webservices.securetrading.net but messageBus is blocking something
const MOCK_GATEWAY_URL = 'https://webservices.securetrading.net:6443';
const GATEWAY_URL = `${MOCK_GATEWAY_URL}/jwt/`;
const MOCK_THIRD_PARTY_URL = 'https://thirdparty.example.com:6443';

export const environment = {
  APPLE_PAY_URLS: {
    MOCK_DATA_URL: `${MOCK_THIRD_PARTY_URL}/applePaymentStatus`,
  },
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'on' },
    },
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_THIRD_PARTY_URL}/cardinalAuthenticateCard`,
    },
    SONGBIRD_LIVE_URL: 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js',
    SONGBIRD_TEST_URL: 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js',
  },
  FRAME_URL: FRAME_URL || 'https://webservices.securetrading.net:6443',
  GATEWAY_URL,
  GA_MEASUREMENT_ID: '42057093-5',
  GA_SCRIPT_SRC: 'https://www.google-analytics.com/analytics_debug.js',
  NOTIFICATION_TTL: 14000,
  VISA_CHECKOUT_URLS: {
    MOCK_DATA_URL: `${MOCK_THIRD_PARTY_URL}/visaPaymentStatus`,
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
  },
  CYBERTONICA: {
    CYBERTONICA_LIVE_URL: 'https://cyber.securetrading.net/js/v2/afeasdwqwdasd.js',
  },
  GOOGLE_PAY: {
    GOOGLE_PAY_URL: 'https://pay.google.com/gp/p/js/pay.js',
    MOCK_DATA_URL: `${MOCK_THIRD_PARTY_URL}/googlePaymentStatus`,
  },
  production: false,
  testEnvironment: true,
  overrideDomain: 'securetrading.net',
  THREEDS_TERM_URL: 'https://payments.securetrading.net/process/payments/threedsmpilistener',
  BROWSER_DATA_URLS: [
    'https://brw.3ds.trustpayments.dev/3dss/brw/browserData',
    'https://brw.3ds.trustpayments.dev/3dss/brw/aragorn',
    'https://brw.3ds.trustpayments.dev/3dss/brw/boromir',
  ],
  REQUEST_TIMEOUT: 30000,
  SENTRY: {
    DSN: null,
    ALLOWED_URLS: [],
    SAMPLE_RATE: 0,
  },
  SEON: {
    LIBRARY_URL: 'https://cdn.seondf.com/js/v4/agent.js',
  },
  SCRIPT_LOAD_TIMEOUT: 30000,
  FRAUD_CONTROL_TIMEOUT: 10000,
  CLICK_TO_PAY: {
    VISA: {
      SRC_SDK_URL: {
        SANDBOX: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js',
        PROD: 'https://assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js',
      },
      SRC_INITIATOR_ID: 'GSTIDU1J8I2NQRWAU7EL21puifGrG2BzgnL9XfBjMzwo9wmtM',
      ENCRYPTION_KID: 'A5CHRN38V3PJ90ACENUH13CCVOyXIL7A8rC9xClvyZyxvMgrE',
    },
  },
};
