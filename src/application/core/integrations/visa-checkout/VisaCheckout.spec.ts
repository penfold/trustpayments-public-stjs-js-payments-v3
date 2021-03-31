import { of } from 'rxjs';
import { VisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IVisaCheckoutSdk } from './visa-checkout-sdk-provider/IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutStatusData } from './visa-checkout-status-data/IVisaCheckoutStatusData';
import { IVisaCheckoutUpdateConfig } from './visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutUpdateService } from './visa-checkout-update-service/VisaCheckoutUpdateService';
import { VisaCheckout } from './VisaCheckout';
import { mock, when, instance as mockInstance, verify, anything, deepEqual, spy } from 'ts-mockito';
import { VisaCheckoutResponseType } from './VisaCheckoutResponseType';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';

describe('VisaCheckout', () => {
  let instance: VisaCheckout;
  let visaCheckoutSdkProviderMock: VisaCheckoutSdkProvider;
  let messageBus: IMessageBus;
  let messageBusSpy: IMessageBus;
  let visaCheckoutUpdateServiceMock: VisaCheckoutUpdateService;

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
  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    livestatus: 0,
    datacenterurl: 'https://example.com',
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
  const visaCheckoutLibMock: IVisaCheckoutSdk = {
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
    },
  };

  beforeEach(() => {
    const form = document.createElement('form');
    form.setAttribute('id', configMock.formId);
    document.body.appendChild(form);
  });

  beforeEach(() => {
    visaCheckoutSdkProviderMock = mock(VisaCheckoutSdkProvider);
    messageBus = new SimpleMessageBus();
    messageBusSpy = spy(messageBus);
    visaCheckoutUpdateServiceMock = mock(VisaCheckoutUpdateService);

    when(visaCheckoutSdkProviderMock.getSdk$(anything(), anything())).thenReturn(of(visaCheckoutLibMock));
    when(visaCheckoutUpdateServiceMock.updateConfigObject(anything())).thenReturn(visaCheckoutUpdateConfigMock);

    instance = new VisaCheckout(
      mockInstance(visaCheckoutSdkProviderMock),
      messageBus,
      mockInstance(visaCheckoutUpdateServiceMock)
    );

    instance.init();

    messageBus.publish({ type: PUBLIC_EVENTS.VISA_CHECKOUT_CONFIG, data: configMock });
  });

  describe('init()', () => {
    it('should set VisaCheckout event response listeners and invoke Message Bus with proper data', () => {
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
            data: {
              status: VisaCheckoutClientStatus.CANCEL,
              data: { cancelData: 'OK' },
            },
          })
        )
      ).once();

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
            data: {
              status: VisaCheckoutClientStatus.ERROR,
              data: { errorData: 'OK' },
            },
          })
        )
      ).once();

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
            data: {
              status: VisaCheckoutClientStatus.PRE_PAYMENT,
              data: { prePaymentData: 'OK' },
            },
          })
        )
      ).once();
    });
  });
});
