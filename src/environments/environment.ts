declare const FRAME_URL: string | undefined;

const GATEWAY_URL = 'https://webservices.securetrading.net/jwt/';
const MOCK_GATEWAY_URL = 'https://merchant.example.com:8443';

export const environment = {
  APM_NAMES: {
    APPLE_PAY: 'APPLEPAY',
    VISA_CHECKOUT: 'VISACHECKOUT',
  },
  APPLE_PAY_URLS: {
    MOCK_DATA_URL: 'https://merchant.example.com:8443/applePaymentStatus',
  },
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'on' },
    },
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_GATEWAY_URL}/cardinalAuthenticateCard`,
    },
    SONGBIRD_LIVE_URL: 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js',
    SONGBIRD_TEST_URL: 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js',
  },
  CARDINAL_COMMERCE_CONFIG: {
    logging: { level: 'on' },
  },
  FRAME_URL: FRAME_URL || 'https://localhost:8443',
  GATEWAY_URL,
  GA_MEASUREMENT_ID: '42057093-5',
  GA_SCRIPT_SRC: 'https://www.google-analytics.com/analytics_debug.js',
  NOTIFICATION_TTL: 7000,
  VISA_CHECKOUT_URLS: {
    LIVE_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    LIVE_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    MOCK_DATA_URL: `${MOCK_GATEWAY_URL}/visaPaymentStatus`,
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
  },
  CYBERTONICA: {
    CYBERTONICA_LIVE_URL: 'https://cyber.securetrading.net/js/v2/afeasdwqwdasd.js',
  },
  GOOGLE_PAY: {
    GOOGLE_PAY_URL: 'https://pay.google.com/gp/p/js/pay.js',
    MOCK_DATA_URL: '',
  },
  production: false,
  testEnvironment: false,
  overrideDomain: '',
  THREEDS_TERM_URL: 'https://payments.securetrading.net/process/payments/threedsmpilistener',
  BROWSER_DATA_URLS: [
    'https://brw.3ds.trustpayments.dev/3dss/brw/browserData1',
    'https://brw.3ds.trustpayments.dev/3dss/brw/aragorn1',
    'https://brw.3ds.trustpayments.dev/3dss/brw/boromir1',
  ],
  REQUEST_TIMEOUT: 30000,
  SENTRY: {
    DSN: 'https://4b5507475285467eb274126ada5a0650@o402164.ingest.sentry.io/6034426',
    ALLOWED_URLS: [],
    SAMPLE_RATE: 1,
  },
  SEON: {
    LIBRARY_URL: 'https://cdn.seondf.com/js/v4/agent.js',
  },
  SCRIPT_LOAD_TIMEOUT: 30000,
  FRAUD_CONTROL_TIMEOUT: 5000,
};
