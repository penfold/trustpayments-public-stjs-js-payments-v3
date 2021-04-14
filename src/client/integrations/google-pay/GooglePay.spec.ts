import { anything, instance as mockInstance, mock, when, verify, instance } from 'ts-mockito';
import { GooglePay } from './GooglePay';
import { IConfig } from '../../../shared/model/config/IConfig';
import { GooglePayPaymentService } from './GooglePayPaymentService';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { of } from 'rxjs';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import {
  IGooglePayPaymentRequest,
  IGooglePlayIsReadyToPayRequest
} from '../../../integrations/google-pay/models/IGooglePayPaymentRequest';

interface IGooglePaySessionPaymentsClient {
  createButton(): void;
  isReadyToPay(): void;
  // loadPaymentData(request: IGooglePayPaymentRequest): Promise<any>;
  // isReadyToPay(request: IGooglePlayIsReadyToPayRequest): Promise<any>;
}

interface IGooglePaySessionApi {
  PaymentsClient(envConfig: any): IGooglePaySessionPaymentsClient;
}

interface IGooglePaySessionPayments {
  api: IGooglePaySessionApi;
}

//.google.payments.api.PaymentsClient({ environment: 'TEST' });
interface IGooglePaySessionConstructor {
  payments: IGooglePaySessionPayments;
}

type WindowType = Window & { google: IGooglePaySessionConstructor | undefined };

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

describe('GooglePay', () => {
  let googlePay: GooglePay;
  let configProviderMock: any;
  let jwtDecoderMock: any;
  let googlePayPaymentService: any;
  let buttonWrapper: any;
  let button: any;
  let windowMock: WindowType;
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
    googlePayPaymentService.processPayment = jest.fn().mockImplementation(() => {});
    // when(googlePayPaymentService.processPayment(anything())).thenReturn(null);
    // jest.spyOn(googlePayPaymentService.processPayment);

    (window.google as any) = {
      payments: {
        api: {
          PaymentsClient: jest.fn().mockImplementation(() => {
            return {
              isReadyToPay: () => {
                return Promise.resolve({ result: true });
              },
              loadPaymentData: () => {
                return Promise.resolve(paymentResponse);
              },
              createButton: (config: any) => {
                console.log('!!!!', document.getElementById('st-google-pay'))
                button = document.createElement('button');
                // button.addEventListener('click', () => {
                //   config.onClick();
                // });
                buttonWrapper.appendChild(button);
              }
            };
          })
        }
      }
    };

    googlePay = new GooglePay(
      mockInstance(configProviderMock),
      mockInstance(googlePayPaymentService),
      mockInstance(jwtDecoderMock)
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

      // document.appendChild(buttonWrapper);
      return Promise.resolve(document.createElement('script'));
    });
    DomMethods.parseForm = jest.fn().mockImplementation(formId => {
      if (formId === 'st-form') {
        return {
          billingprice: '',
          billingamount: '',
          billinglastname: '',
          billingemail: ''
        };
      }
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

    // it('should pass GooglePay response to the ST Transport after button is clicked', async () => {
    //   console.log(' =============================================== ');
    //   console.log('=====>', buttonWrapper);
    //   const event = new Event('click');
    //   // @ts-ignore
    //   button.dispatchEvent(event);

    //   await flushPromises();
    //   // expect(googlePayPaymentService.processPayment).toHaveBeenCalled();
    //   expect(true).toBeTruthy();
    // });
  });
});
