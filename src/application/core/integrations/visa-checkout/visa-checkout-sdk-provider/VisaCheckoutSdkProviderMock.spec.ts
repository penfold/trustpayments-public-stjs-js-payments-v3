import { anything, deepEqual, instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { SentryService } from '../../../../../shared/services/sentry/SentryService';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { VisaCheckoutSdkProviderMock } from './VisaCheckoutSdkProviderMock';

describe('VisaCheckoutSdkProviderMock', () => {
  let visaCheckoutSdkProviderMock: VisaCheckoutSdkProviderMock;
  let visaCheckoutButtonServiceMock: VisaCheckoutButtonService;
  let sentryServiceMock: SentryService;

  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    datacenterurl: 'https://example.com',
    livestatus: 0,
    visaCheckout: {
      buttonSettings: {
        size: 154,
        color: 'neutral',
      },
      livestatus: 0,
      merchantId: '',
      paymentRequest: {
        subtotal: '20.0',
      },
      placement: 'st-visa-checkout',
      settings: {
        displayName: 'My Test Site',
      },
    },
  };
  const visaCheckoutUpdateConfigMock: IVisaCheckoutUpdateConfig = {
    buttonUrl: 'https://button-mock-url.com',
    sdkUrl: 'https://sdk-mock-url.com',
    visaInitConfig: {
      apikey: '',
      encryptionKey: '',
      paymentRequest: {
        currencyCode: '',
        subtotal: '',
        total: '',
      },
    },
  };

  beforeEach(() => {
    visaCheckoutButtonServiceMock = mock(VisaCheckoutButtonService);
    sentryServiceMock = mock(SentryService);
    when(sentryServiceMock.captureAndReportResourceLoadingTimeout(anything())).thenReturn(source => source);

    visaCheckoutSdkProviderMock = new VisaCheckoutSdkProviderMock(mockInstance(visaCheckoutButtonServiceMock), mockInstance(sentryServiceMock));
  });

  describe('getSdk$()', () => {
    it('should invoke return proper sdk object and invoke proper services methods', done => {
      visaCheckoutSdkProviderMock
        .getSdk$(configMock, visaCheckoutUpdateConfigMock)
        .subscribe((sdk: IVisaCheckoutSdk) => {
          verify(
            visaCheckoutButtonServiceMock.mount(
              configMock.visaCheckout.placement,
              deepEqual(configMock.visaCheckout.buttonSettings),
              visaCheckoutUpdateConfigMock.buttonUrl
            )
          ).once();
          // Needs to stringify as Jest cannot compare functions
          expect(JSON.stringify(sdk)).toBe(
            JSON.stringify({
              init: () => {
              },
              on: () => {
              },
            })
          );

          done();
        });
    });
  });
});
