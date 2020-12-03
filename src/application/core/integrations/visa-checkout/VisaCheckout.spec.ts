import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutUpdateConfig } from './visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckout } from './VisaCheckout';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { anyString, mock, when, instance as mockInstance, verify } from 'ts-mockito';

describe('Visa Checkout', () => {
  let instance: VisaCheckout;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let visaCheckoutSdkProvider: VisaCheckoutSdkProvider;

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
  const jwtPayloadMock: IStJwtPayload = {};
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
  const messages = new Subject<IMessageBusEvent>();

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    visaCheckoutSdkProvider = mock(VisaCheckoutSdkProvider);

    when(interFrameCommunicatorMock.whenReceive(anyString())).thenCall((eventType: string) => {
      return {
        thenRespond: (responder: any) => {
          messages
            .pipe(
              ofType(eventType),
              switchMap(event => responder(event))
            )
            .subscribe();
        }
      };
    });

    instance = new VisaCheckout(mockInstance(interFrameCommunicatorMock), mockInstance(visaCheckoutSdkProvider));

    instance.init();
  });

  describe('init()', () => {
    it('invoke loadSdk$() method to inject script and mount the button', () => {
      messages.next({
        type: PUBLIC_EVENTS.VISA_CHECKOUT_START,
        data: configMock
      });

      verify(visaCheckoutSdkProvider.getSdk$(configMock)).once();
    });
  });
});
