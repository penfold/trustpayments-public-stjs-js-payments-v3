import { IGooglePayConfig } from '../../../integrations/google-pay/models/IGooglePayConfig';

export const googlePayConfigMock: IGooglePayConfig = {
  buttonOptions: {
    buttonRootNode: 'st-google-pay',
    buttonColor: 'default',
    buttonType: 'buy',
    buttonLocale: 'en',
  },
  paymentRequest: {
    allowedPaymentMethods: [{
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
      },
      tokenizationSpecification: {
        parameters: {
          gateway: 'trustpayments',
          gatewayMerchantId: 'test_jsautocardinal91923',
        },
        type: 'PAYMENT_GATEWAY',
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
      totalPriceStatus: 'FINAL',
      totalPrice: '10',
      displayItems: [
        {
          label: 'Example item',
          price: '10',
          type: 'LINE_ITEM',
          status: 'FINAL',
        },
      ],
    },
  },
};
