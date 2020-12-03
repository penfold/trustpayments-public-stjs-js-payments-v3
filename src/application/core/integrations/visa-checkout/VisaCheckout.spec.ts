import { of, Subject } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { IVisaCheckoutUpdateConfig } from './visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckout } from './VisaCheckout';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { anyString, mock, when, instance as mockInstance, anything, capture, verify } from 'ts-mockito';
import { VisaCheckoutButtonService } from './visa-checkout-button-service/VisaCheckoutButtonService';
import { VisaCheckoutUpdateService } from './visa-checkout-update-service/VisaCheckoutUpdateService';
import { VisaCheckoutScriptInjector } from './VisaCheckoutScriptInjector';

describe('Visa Checkout', () => {
  let instance: VisaCheckout;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let visaCheckoutButtonServiceMock: VisaCheckoutButtonService;
  let visaCheckoutUpdateServiceMock: VisaCheckoutUpdateService;
  let jwtDecoderMock: JwtDecoder;
  let visaCheckoutScriptInjector: VisaCheckoutScriptInjector;

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
    visaCheckoutButtonServiceMock = mock(VisaCheckoutButtonService);
    visaCheckoutUpdateServiceMock = mock(VisaCheckoutUpdateService);
    jwtDecoderMock = mock(JwtDecoder);
    visaCheckoutScriptInjector = mock(VisaCheckoutScriptInjector);

    when(visaCheckoutUpdateServiceMock.updateConfigObject(anything(), anything(), anything())).thenReturn(
      visaCheckoutUpdateConfigMock
    );
    when(jwtDecoderMock.decode(anything())).thenReturn({
      payload: jwtPayloadMock
    });
    when(visaCheckoutScriptInjector.injectScript(anything(), anything())).thenReturn(
      of(document.createElement('script'))
    );
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

    instance = new VisaCheckout(
      mockInstance(interFrameCommunicatorMock),
      mockInstance(visaCheckoutButtonServiceMock),
      mockInstance(visaCheckoutUpdateServiceMock),
      mockInstance(jwtDecoderMock),
      mockInstance(visaCheckoutScriptInjector)
    );

    instance.init();
  });

  describe('init()', () => {
    it('invoke loadSdk$() method to inject script and mount the button', () => {
      messages.next({
        type: PUBLIC_EVENTS.VISA_CHECKOUT_START,
        data: configMock
      });

      verify(
        visaCheckoutUpdateServiceMock.updateConfigObject(configMock.visaCheckout, jwtPayloadMock, configMock.livestatus)
      ).once();

      verify(
        visaCheckoutButtonServiceMock.customize(
          configMock.visaCheckout.buttonSettings,
          visaCheckoutUpdateConfigMock.buttonUrl
        )
      ).once();
    });
  });
});
