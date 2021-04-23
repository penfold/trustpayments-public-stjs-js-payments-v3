import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { IPaymentResponse } from '../../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { IGooglePaySessionPaymentsClient } from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { GooglePaySdkProvider } from './GooglePaySdkProvider';
import DoneCallback = jest.DoneCallback;

describe('GooglePaySdkProvider', () => {
  let sut: GooglePaySdkProvider;

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
        buttonLocale: 'en',
      },
      paymentRequest: {
        allowedPaymentMethods: {
          parameters: {
            allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
          },
          tokenizationSpecification: {
            parameters: {
              gateway: 'trustpayments',
              gatewayMerchantId: 'test_james38641',
            },
            type: 'PAYMENT_GATEWAY',
          },
          type: 'CARD',
        },
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
    },
  };
  const paymentResponseMock: IPaymentResponse = {
    apiVersion: 2,
    apiVersionMinor: 0,
    paymentMethodData: {
      description: 'Mastercard •••• 4444',
      info: {
        cardDetails: '4444',
        cardNetwork: 'MASTERCARD',
      },
    },
    tokenizationData: {
      token: 'sometoken',
      type: 'PAYMENT_GATEWAY',
    },
    type: 'CARD',
  };

  beforeAll(() => {
    sut = new GooglePaySdkProvider();

    (window as any).google = {
      payments: {
        api: {
          PaymentsClient: jest.fn().mockImplementation(() => {
            return {
              isReadyToPay: () => {
                return Promise.resolve({ result: true });
              },
              loadPaymentData: () => {
                return Promise.resolve(paymentResponseMock);
              },
              createButton: (config: any) => {
                const button = document.createElement('button');
                button.addEventListener('click', () => {
                  config.onClick();
                });

                return button;
              },
            };
          }),
        },
      },
    };

    DomMethods.insertScript = jest.fn().mockImplementation(() => {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.setAttribute('id', 'st-google-pay');

      return Promise.resolve(document.createElement('script'));
    });
  });

  describe('setupSdk$()', () => {
    it('should insert the script and return Google Pay SDK', (done: DoneCallback) => {
      sut.setupSdk$(configMock).subscribe((googlePaySdk: IGooglePaySessionPaymentsClient) => {
        expect(googlePaySdk.isReadyToPay()).toBeDefined();
        expect(googlePaySdk.loadPaymentData).toBeDefined();
        expect(googlePaySdk.createButton).toBeDefined();
        expect(DomMethods.insertScript).toHaveBeenCalled();
        done();
      });
    });
  });
});
