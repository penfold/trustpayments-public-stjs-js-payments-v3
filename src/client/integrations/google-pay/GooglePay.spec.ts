import { anything, instance as mockInstance, mock, when, verify } from 'ts-mockito';
import { GooglePay } from './GooglePay';
import { IConfig } from '../../../shared/model/config/IConfig';
import { GooglePayPaymentService } from './GooglePayPaymentService';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { of } from 'rxjs';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';

describe('GooglePay', () => {
  let googlePay: GooglePay;
  let configProviderMock: any;
  let jwtDecoderMock: any;
  let googlePayPaymentService: any;
  let buttonWrapper: any;
  let button: any;
  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    livestatus: 0,
    datacenterurl: 'https://example.com',
    visaCheckout: null,
    googlePay: {
      buttonOptions: {
        buttonRootNode: 'st-google-pay',
        buttonColor: 'default',
        buttonType: 'buy',
        buttonLocale: 'en'
      },
      paymentRequest: {
        allowedPaymentMethods: {
          parameters: {
            allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            parameters: {
              gateway: 'trustpayments',
              gatewayMerchantId: 'test_james38641'
            },
            type: 'PAYMENT_GATEWAY'
          },
          type: 'CARD'
        },
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
          merchantId: 'merchant.net.securetrading',
          merchantName: 'merchang'
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
              status: 'FINAL'
            }
          ]
        }
      }
    }
  };
  const paymentResponse = {
    apiVersion: 2,
    apiVersionMinor: 0,
    paymentMethodData: {
      description: 'Mastercard •••• 4444',
      info: {
        cardDetails: '4444',
        cardNetwork: 'MASTERCARD'
      }
    },
    tokenizationData: {
      token: 'sometoken',
      type: 'PAYMENT_GATEWAY'
    },
    type: 'CARD'
  };

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();
    jwtDecoderMock = mock(JwtDecoder);
    googlePayPaymentService = mock(GooglePayPaymentService);

    googlePay = new GooglePay(
      mockInstance(configProviderMock),
      mockInstance(jwtDecoderMock),
      mockInstance(googlePayPaymentService)
    );

    when(configProviderMock.getConfig$()).thenReturn(of(configMock));
    when(jwtDecoderMock.decode(anything())).thenReturn({
      payload: {
        requesttypedescriptions: ['AUTH']
      }
    });
    DomMethods.insertScript = jest.fn().mockImplementation((target, options) => {
      buttonWrapper = document.createElement('div');
      buttonWrapper.setAttribute('id', 'st-google-pay');
      button = document.createElement('button');
      buttonWrapper.appendChild(button);

      return Promise.resolve(document.createElement('script'));
    });

    googlePay.init(configMock);
  });

  describe('init()', () => {
    it('should insert Google Pay script', () => {
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', {
        src: 'https://pay.google.com/gp/p/js/pay.js'
      });
    });

    it('should display button after init', () => {
      expect(buttonWrapper.childNodes.length > 0).toBe(true);
    });

    it('should pass GooglePay response to the ST Transport after button is clicked', () => {});
  });
});
