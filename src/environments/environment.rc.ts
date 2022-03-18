declare const FRAME_URL: string | undefined;

const GATEWAY_URL = 'https://webservices.securetrading.net/jwt/';
const MOCK_GATEWAY_URL = 'https://merchant.example.com:8443';

export const environment = {
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'off' },
    },
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_GATEWAY_URL}/cardinalAuthenticateCard`,
    },
    SONGBIRD_LIVE_URL: 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js',
    SONGBIRD_TEST_URL: 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js',
  },
  FRAME_URL: FRAME_URL || 'https://webservices.securetrading.net/js/v3',
  GATEWAY_URL,
  GA_MEASUREMENT_ID: '42057093-6',
  GA_SCRIPT_SRC: 'https://www.google-analytics.com/analytics.js',
  NOTIFICATION_TTL: 7000,
  VISA_CHECKOUT_URLS: {
    LIVE_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    LIVE_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
  },
  CYBERTONICA: {
    CYBERTONICA_LIVE_URL: 'https://cyber.securetrading.net/js/v2/afeasdwqwdasd.js',
  },
  GOOGLE_PAY: {
    GOOGLE_PAY_URL: 'https://pay.google.com/gp/p/js/pay.js',
  },
  production: true,
  testEnvironment: false,
  overrideDomain: '',
  THREEDS_TERM_URL: 'https://payments.securetrading.net/process/payments/threedsmpilistener',
  BROWSER_DATA_URL: 'https://brw.3ds.trustpayments.dev/3dss/brw/browserData',
  REQUEST_TIMEOUT: 30000,
  SENTRY: {
    DSN: 'https://6319b9ff1fb14ba48cd2c9025d67bd2d@o402164.ingest.sentry.io/5262818',
    ALLOWED_URLS: ['https://webservices.securetrading.net'],
    SAMPLE_RATE: 0.1,
  },
  SEON: {
    LIBRARY_URL: 'https://cdn.seondf.com/js/v4/agent.js',
  },
  SCRIPT_LOAD_TIMEOUT: 30000,
  FRAUD_CONTROL_TIMEOUT: 5000,
  CLICK_TO_PAY: {
    VISA: {
      SRC_SDK_URL: {
        SANDBOX: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js',
        PROD: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js',
      },
      SRC_INITIATOR_ID: 'GSTIDU1J8I2NQRWAU7EL21puifGrG2BzgnL9XfBjMzwo9wmtM',
      ENCRYPTION_KID: 'A5CHRN38V3PJ90ACENUH13CCVOyXIL7A8rC9xClvyZyxvMgrE',
    },
  },
};
