import { of, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
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
import { anyString, mock, when, instance as mockInstance, anything, capture } from 'ts-mockito';
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

    when(interFrameCommunicatorMock.whenReceive(anyString())).thenCall((eventType: string) => {
      return {
        thenRespond: (responder: any) => {
          messages.pipe(ofType(eventType), first()).subscribe(event => responder(event));
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
  });

  describe('init()', () => {
    it('invoke loadSdk$() method to inject script and mount the button', done => {
      const visaCheckoutUpdateConfig: IVisaCheckoutUpdateConfig = {
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
      const jwtPayload: IStJwtPayload = {};

      when(visaCheckoutUpdateServiceMock.updateConfigObject(anything(), anything(), anything())).thenReturn(
        visaCheckoutUpdateConfig
      );
      when(jwtDecoderMock.decode(anything())).thenReturn({
        payload: jwtPayload
      });
      when(visaCheckoutScriptInjector.injectScript(anything(), anything())).thenReturn(
        of(document.createElement('script'))
      );

      instance.init();
      messages.next({
        type: PUBLIC_EVENTS.VISA_CHECKOUT_START,
        data: configMock
      });

      expect(capture(visaCheckoutUpdateServiceMock.updateConfigObject).first()).toEqual([
        configMock.visaCheckout,
        jwtPayload,
        configMock.livestatus
      ]);
      // expect(capture(visaCheckoutButtonServiceMock.customize).first()).toEqual([
      //   configMock.visaCheckout.buttonSettings,
      //   configMock.visaCheckout.buttonSettings,
      //   visaCheckoutUpdateConfig.buttonUrl
      // ]);

      done();
    });
  });
});
