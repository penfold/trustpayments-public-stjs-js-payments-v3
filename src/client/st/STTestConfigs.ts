import { IConfig } from '../../shared/model/config/IConfig';
import { IGooglePayConfig } from '../../integrations/google-pay/models/IGooglePayConfig';
import { IVisaCheckoutConfig } from '../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';

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
  'Card number is invalid': 'Numer karty jest nieprawidłowy',
};

const styles = {
  cardNumber: {
    'background-color-input': 'AliceBlue',
    'background-color-input-error': '#f8d7da',
    'color-input-error': '#721c24',
    'font-size-input': '12px',
    'line-height-input': '12px',
  },
  expirationDate: {
    'background-color-input': 'AliceBlue',
    'background-color-input-error': '#f8d7da',
    'color-input-error': '#721c24',
    'font-size-input': '12px',
    'line-height-input': '12px',
  },
  securityCode: {
    'background-color-input': 'AliceBlue',
    'background-color-input-error': '#f8d7da',
    'color-input-error': '#721c24',
    'font-size-input': '12px',
    'line-height-input': '12px',
  },
};

const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU2MDk0NjM4Ny4yNDIzMzQ0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiNDExMTExMTExMTExMTExMSIsImV4cGlyeWRhdGUiOiIwMS8yMCIsInNlY3VyaXR5Y29kZSI6IjEyMyJ9fQ.UssdRcocpaeAqd-jDXpxWeWiKIX-W7zlpy0UWrDE5vg';

const config: IConfig = {
  analytics: true,
  animatedCard: true,
  components: { defaultPaymentType: 'test', paymentTypes: ['test'] },
  jwt,
  livestatus: 0,
  disableNotification: false,
  cybertonicaApiKey: 'testid',
  origin: 'https://someorigin.com',
  styles,
  submitOnError: false,
  submitOnSuccess: false,
  translations,
  buttonId: 'merchant-submit-button',
};

const applePayConfig = {
  buttonStyle: 'white-outline',
  buttonText: 'donate',
  merchantId: '',
  paymentRequest: {
    countryCode: 'US',
    currencyCode: 'USD',
    merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    total: {
      label: 'Secure Trading Merchant',
      amount: '10.00',
    },
  },
  placement: 'st-apple-pay',
};

const googlePayConfig: IGooglePayConfig = {
  buttonOptions: {
    buttonRootNode: 'test',
  },
  paymentRequest: {
    allowedPaymentMethods: [{
      parameters: {
        allowedAuthMethods: ['PAN_ONLY'],
        allowedCardNetworks: ['VISA'],
      },
      tokenizationSpecification: {
        parameters: {
          gateway: 'https://someorigin.com',
          gatewayMerchantId: 'merchant.net.securetrading',
        },
        type: 'test',
      },
      type: 'CARD',
    }],
    apiVersion: 2,
    apiVersionMinor: 0,
    merchantInfo: {
      merchantId: 'merchant.net.securetrading',
      merchantName: 'merchang',
    },
    transactionInfo: {
      countryCode: 'pl',
      currencyCode: 'pln',
      checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
      displayItems: [
        {
          label: 'Example item',
          price: '10.00',
          type: 'LINE_ITEM',
          status: 'FINAL',
        },
      ],
    },
  },
};

const visaCheckoutConfig: IVisaCheckoutConfig = {
  buttonSettings: {
    size: 154,
    color: 'neutral',
  },
  livestatus: 0,
  merchantId: 'sometestid',
  paymentRequest: {
    subtotal: '20.00',
  },
  placement: 'st-visa-checkout',
  settings: {
    displayName: 'My Test Site',
  },
};

export { translations, applePayConfig, googlePayConfig, visaCheckoutConfig, config, jwt };
