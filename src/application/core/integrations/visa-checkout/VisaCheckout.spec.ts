import { of } from 'rxjs';
import { VisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IVisaCheckoutSdkLib } from './visa-checkout-sdk-provider/IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutStatusData } from './visa-checkout-status-data/IVisaCheckoutStatusData';
import { IVisaCheckoutUpdateConfig } from './visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckout } from './VisaCheckout';
import { mock, when, instance as mockInstance, verify, anything, deepEqual } from 'ts-mockito';
import { VisaCheckoutResponseType } from './VisaCheckoutResponseType';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';

describe('VisaCheckout', () => {
  let instance: VisaCheckout;
  let visaCheckoutSdkProviderMock: VisaCheckoutSdkProvider;
  let messageBusMock: IMessageBus;

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

    when(messageBusMock.pipe(anything())).thenReturn(of(configMock));
    when(visaCheckoutSdkProviderMock.getSdk$(anything())).thenReturn(
      of({
        lib: visaCheckoutLibMock,
        updateConfig: visaCheckoutUpdateConfigMock
      })
    );

    instance = new VisaCheckout(mockInstance(visaCheckoutSdkProviderMock), mockInstance(messageBusMock));

    instance.init();
  });

  describe('init()', () => {
    it('should set VisaCheckout event response listeners and invoke Message Bus with proper data', () => {
      verify(
        messageBusMock.publish(
          deepEqual({
            type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
            data: {
              status: VisaCheckoutClientStatus.CANCEL,
              data: { cancelData: 'OK' }
            }
          })
        )
      ).once();

      verify(
        messageBusMock.publish(
          deepEqual({
            type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
            data: {
              status: VisaCheckoutClientStatus.ERROR,
              data: { errorData: 'OK' }
            }
          })
        )
      ).once();

      verify(
        messageBusMock.publish(
          deepEqual({
            type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
            data: {
              status: VisaCheckoutClientStatus.PRE_PAYMENT,
              data: { prePaymentData: 'OK' }
            }
          })
        )
      ).once();
    });
  });
});
