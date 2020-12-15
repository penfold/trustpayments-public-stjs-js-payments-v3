import { of } from 'rxjs';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IVisaCheckoutSdkLib } from './visa-checkout-sdk-provider/IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutStatusData } from './visa-checkout-status-data/IVisaCheckoutStatusData';
import { mock, when, instance as mockInstance, verify, anything } from 'ts-mockito';
import { VisaCheckoutUpdateService } from './visa-checkout-update-service/VisaCheckoutUpdateService';
import { VisaCheckoutMock } from './VisaCheckoutMock';
import { VisaCheckoutResponseType } from './VisaCheckoutResponseType';

jest.mock('../../shared/dom-methods/DomMethods');

describe('VisaCheckoutMock', () => {
  let instance: VisaCheckoutMock;
  let visaCheckoutSdkProviderMock: VisaCheckoutSdkProvider;
  let messageBusMock: IMessageBus;
  let visaCheckoutUpdateServiceMock: VisaCheckoutUpdateService;

  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    livestatus: 0,
    datacenterurl: 'https://example.com',
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
  const visaCheckoutLibMock: IVisaCheckoutSdkLib = {
    init: () => {},
    on: (resType: VisaCheckoutResponseType, cb: (statusData: IVisaCheckoutStatusData) => void) => {
      switch (resType) {
        case VisaCheckoutResponseType.success:
          cb({ successData: 'OK' });
          break;

        case VisaCheckoutResponseType.cancel:
          cb({ cancelData: 'OK' });
          break;

        case VisaCheckoutResponseType.error:
          cb({ errorData: 'OK' });
          break;

        case VisaCheckoutResponseType.prePayment:
          cb({ prePaymentData: 'OK' });
          break;
      }
    }
  };

  beforeEach(() => {
    visaCheckoutSdkProviderMock = mock(VisaCheckoutSdkProvider);
    messageBusMock = mock<IMessageBus>();
    visaCheckoutUpdateServiceMock = mock(VisaCheckoutUpdateService);

    when(messageBusMock.pipe(anything())).thenReturn(of(configMock));
    when(visaCheckoutSdkProviderMock.getSdk$(anything(), anything())).thenReturn(
      of({
        lib: visaCheckoutLibMock
      })
    );

    instance = new VisaCheckoutMock(
      mockInstance(visaCheckoutSdkProviderMock),
      mockInstance(messageBusMock),
      mockInstance(visaCheckoutUpdateServiceMock)
    );
  });

  describe('init()', () => {
    it('should set VisaCheckout event response listeners and invoke Message Bus with proper data', () => {
      instance.init();

      verify(messageBusMock.pipe(anything())).once();
      verify(visaCheckoutSdkProviderMock.getSdk$(anything(), anything())).once();
    });
  });
});
