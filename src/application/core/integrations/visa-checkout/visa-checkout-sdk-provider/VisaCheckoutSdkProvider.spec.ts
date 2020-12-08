import { anything, deepEqual, instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutUpdateService } from '../visa-checkout-update-service/VisaCheckoutUpdateService';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './VisaCheckoutSdkProvider';

jest.mock('../../../shared/dom-methods/DomMethods');

describe('VisaCheckoutSdkProvider', () => {
  let visaCheckoutSdkProvider: VisaCheckoutSdkProvider;
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

    visaCheckoutSdkProvider = new VisaCheckoutSdkProvider(
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
    xit(`should `, done => {
      visaCheckoutSdkProvider.getSdk$(configMock).subscribe((sdk: IVisaCheckoutSdk) => {
        verify(
          visaCheckoutUpdateServiceMock.updateConfigObject(
            deepEqual(configMock.visaCheckout),
            deepEqual(jwtDecodePayloadMock),
            configMock.livestatus
          )
        ).once();
      });
    });
  });
});
