import { of } from 'rxjs';
import { anything, deepEqual, instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { SentryService } from '../../../../../shared/services/sentry/SentryService';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './VisaCheckoutSdkProvider';

describe('VisaCheckoutSdkProvider', () => {
  let visaCheckoutSdkProvider: VisaCheckoutSdkProvider;
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

    visaCheckoutSdkProvider = new VisaCheckoutSdkProvider(mockInstance(visaCheckoutButtonServiceMock), mockInstance(sentryServiceMock));
    visaCheckoutSdkProvider.insertScript$ = () => of(document.createElement('script'));
  });

  describe('getSdk$()', () => {
    it('should return proper sdk object and invoke proper services methods', done => {
      visaCheckoutSdkProvider.getSdk$(configMock, visaCheckoutUpdateConfigMock).subscribe((sdk: IVisaCheckoutSdk) => {
        verify(
          visaCheckoutButtonServiceMock.mount(
            configMock.visaCheckout.placement,
            deepEqual(configMock.visaCheckout.buttonSettings),
            visaCheckoutUpdateConfigMock.buttonUrl
          )
        ).once();
        expect(sdk).toEqual(undefined);

        done();
      });
    });
  });
});
