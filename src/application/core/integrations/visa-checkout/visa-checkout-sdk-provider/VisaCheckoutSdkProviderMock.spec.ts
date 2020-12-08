import { anything, deepEqual, instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutUpdateService } from '../visa-checkout-update-service/VisaCheckoutUpdateService';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { VisaCheckoutSdkProviderMock } from './VisaCheckoutSdkProviderMock';

describe('VisaCheckoutSdkProviderMock', () => {
  let visaCheckoutSdkProviderMock: VisaCheckoutSdkProviderMock;
  let visaCheckoutUpdateServiceMock: VisaCheckoutUpdateService;
  let jwtDecoderMock: JwtDecoder;
  let visaCheckoutButtonServiceMock: VisaCheckoutButtonService;

  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    datacenterurl: 'https://example.com',
    livestatus: 0,
    visaCheckout: {
      buttonSettings: {
        size: 154,
        color: 'neutral'
      },
      livestatus: 0,
      merchantId: '',
      paymentRequest: {
        subtotal: '20.0'
      },
      placement: 'st-visa-checkout',
      settings: {
        displayName: 'My Test Site'
      }
    }
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
        total: ''
      }
    }
  };
  const jwtDecodePayloadMock: IStJwtPayload = {
    requesttypedescriptions: ['AUTH']
  };

  beforeEach(() => {
    visaCheckoutUpdateServiceMock = mock(VisaCheckoutUpdateService);
    jwtDecoderMock = mock(JwtDecoder);
    visaCheckoutButtonServiceMock = mock(VisaCheckoutButtonService);

    visaCheckoutSdkProviderMock = new VisaCheckoutSdkProviderMock(
      mockInstance(visaCheckoutUpdateServiceMock),
      mockInstance(jwtDecoderMock),
      mockInstance(visaCheckoutButtonServiceMock)
    );

    when(jwtDecoderMock.decode(anything())).thenReturn({
      payload: jwtDecodePayloadMock
    });
    when(visaCheckoutUpdateServiceMock.updateConfigObject(anything(), anything(), anything())).thenReturn(
      visaCheckoutUpdateConfigMock
    );
  });

  describe('getSdk$()', () => {
    it('should invoke return proper sdk object and invoke proper services methods', done => {
      visaCheckoutSdkProviderMock.getSdk$(configMock).subscribe((sdk: IVisaCheckoutSdk) => {
        verify(
          visaCheckoutUpdateServiceMock.updateConfigObject(
            deepEqual(configMock.visaCheckout),
            deepEqual(jwtDecodePayloadMock),
            configMock.livestatus
          )
        ).once();
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
            lib: {
              init: () => {},
              on: () => {}
            },
            updateConfig: visaCheckoutUpdateConfigMock
          })
        );

        done();
      });
    });
  });
});
