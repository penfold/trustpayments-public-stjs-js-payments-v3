import { of } from 'rxjs';
import { anyFunction, anything, instance as mockInstance, mock, when } from 'ts-mockito';
import Container from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { CustomerOutput } from '../../application/core/models/constants/CustomerOutput';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IConfig } from '../../shared/model/config/IConfig';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import { RequestType } from '../../shared/types/RequestType';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import {
  PAYMENT_CANCELLED,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS,
} from '../../application/core/models/constants/Translations';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { TranslatorToken } from '../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../application/core/shared/translator/Translator';
import { ITranslationProvider } from '../../application/core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../application/core/shared/translator/TranslationProvider';
import { TestConfigProvider } from '../../testing/mocks/TestConfigProvider';
import { Enrollment } from '../../application/core/models/constants/Enrollment';
import { EventScope } from '../../application/core/models/constants/EventScope';
import { CommonFrames } from './CommonFrames';

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('CommonFrames', () => {
  const jwt = 'some jwt';
  let commonFrames: CommonFrames;
  let configProvider: ConfigProvider;
  let frame: Frame;
  let iframeFactory: IframeFactory;
  let jwtDecoder: JwtDecoder;
  let localStorage: BrowserLocalStorage;
  let messageBus: IMessageBus;

  beforeEach(() => {
    document.body.innerHTML =
      '<form id="st-form"><input type="text" name="test-field-1" id="test-field-1"/><input type="text" name="test-field-2" id="test-field-2"/><input type="hidden" name="somefield1" value="somefield1"/><input type="hidden" name="somefield2" value="somefield2"/><input type="hidden" name="eci" value="eci"/></form>';
    configProvider = mock<ConfigProvider>();
    frame = mock(Frame);
    iframeFactory = mock(IframeFactory);
    jwtDecoder = mock(JwtDecoder);
    localStorage = mock(BrowserLocalStorage);
    messageBus = new SimpleMessageBus();

    window.HTMLFormElement.prototype.submit = () => {};

    when(configProvider.getConfig$()).thenReturn(
      of({
        jwt: jwt,
        formId: 'st-form',
        datacenterurl: 'test',
        origin: 'testorigin',
        styles: {
          controlFrame: {
            'background-color-input': 'AliceBlue',
          },
        },
        submitFields: ['baseamount', 'eci'],
        submitOnSuccess: true,
      } as IConfig)
    );

    when(localStorage.select(anyFunction())).thenReturn(of('true'));

    when(iframeFactory.create(anything(), anything(), anything(), anything(), anything())).thenCall(
      (name: string, id: string) => {
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframe.setAttribute('name', name);
        iframe.setAttribute('id', id);
        return iframe;
      }
    );

    when(frame.parseUrl()).thenReturn({ params: { locale: 'en_GB' } });

    commonFrames = new CommonFrames(
      mockInstance(configProvider),
      mockInstance(frame),
      mockInstance(iframeFactory),
      mockInstance(jwtDecoder),
      mockInstance(localStorage),
      messageBus
    );

    commonFrames.init();
  });

  afterEach(() => {
    document.getElementsByTagName('form')[0].innerHTML = '';
  });

  describe('when control frame is initialized', () => {
    it('should init control frame component and insert only one iframe into merchants form', () => {
      const iframe = document.getElementsByTagName('iframe');
      expect(iframe[0].getAttribute('id')).toEqual('st-control-frame-iframe');
      expect(iframe.length).toEqual(1);
    });

    it('should remove the control frame iframe on destroy event', () => {
      const iframeId = 'st-control-frame-iframe';
      expect(document.getElementById(iframeId)).toBeTruthy();
      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      expect(document.getElementById(iframeId)).toBeFalsy();
    });
  });

  describe('submit process when payment has been cancelled', () => {
    const data = {
      errorcode: 'cancelled',
      errormessage: PAYMENT_CANCELLED,
      jwt: 'testjwt',
      threedresponse: 'threedresponse',
    };

    it('should call submit process with cancel status and check if jwt, thredresponse and additional fields were not included', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });

        expect(document.getElementsByName('jwt')[0]).toEqual(undefined);
        expect(document.getElementsByName('threedresponse')[0]).toEqual(undefined);
        expect(document.getElementsByName('baseamount')[0]).toEqual(undefined);
        expect(document.getElementsByName('eci')[0]).toEqual(undefined);
        expect(document.getElementsByName('errorcode')[0].getAttribute('value')).toEqual(data.errorcode);
        expect(document.getElementsByName('errormessage')[0].getAttribute('value')).toEqual(data.errormessage);
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should call submit process with cancel status and check if jwt, thredresponse and other defined fields were not included', done => {
      const data = {
        errorcode: 'cancelled',
        errormessage: PAYMENT_CANCELLED,
        jwt: 'testjwt',
        threedresponse: 'threedresponse',
        baseamount: 'some amount',
        eci: 'test eci',
        enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });

        expect(document.getElementsByName('jwt')[0]).toEqual(undefined);
        expect(document.getElementsByName('threedresponse')[0]).toEqual(undefined);
        expect(document.getElementsByName('baseamount')[0]).toEqual(undefined);
        expect(document.getElementsByName('eci')[0]).toEqual(undefined);
        expect(document.getElementsByName('errorcode')[0].getAttribute('value')).toEqual(data.errorcode);
        expect(document.getElementsByName('errormessage')[0].getAttribute('value')).toEqual(data.errormessage);
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should call submit callback when TP-3DS popup is cancelled - isCancelled flag', done => {
      const data = {
        errorcode: '0',
        errormessage: PAYMENT_CANCELLED,
        jwt: 'testjwt',
        baseamount: '20',
        eci: 'eci',
        enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
        requesttypedescription: RequestType.THREEDQUERY,
        isCancelled: true,
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK)).subscribe(event => {
        expect(event.data).toBe(data);
        done();
      });

      messageBus.publish({ type: PUBLIC_EVENTS.TRANSACTION_COMPLETE, data });
    });
  });

  describe('submit process when payment status is error', () => {
    const data = {
      errorcode: '50003',
      errormessage: PAYMENT_ERROR,
      jwt: 'testjwt',
      threedresponse: 'some threedresponse',
      baseamount: 'some amount',
      eci: 'test eci',
      enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
    };

    it('should call submit process with 50003 error status and check if jwt and threedresponse fields were included', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });
        expect(document.getElementsByName('jwt')[0].getAttribute('value')).toEqual(data.jwt);
        expect(document.getElementsByName('threedresponse')[0].getAttribute('value')).toEqual(data.threedresponse);
        expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual(data.baseamount);
        expect(document.getElementsByName('eci')[0].getAttribute('value')).toEqual(data.eci);
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should call submit process with 22000 error status and check if jwt and threedresponse fields were included', done => {
      const data = {
        errorcode: '22000',
        errormessage: PAYMENT_ERROR,
        jwt: 'testjwt',
        threedresponse: 'some threedresponse',
        baseamount: 'some amount',
        eci: 'test eci',
        enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });
        expect(document.getElementsByName('jwt')[0].getAttribute('value')).toEqual('testjwt');
        expect(document.getElementsByName('threedresponse')[0].getAttribute('value')).toEqual('some threedresponse');
        expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual('some amount');
        expect(document.getElementsByName('eci')[0].getAttribute('value')).toEqual('test eci');
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });
  });

  describe('submit process when payment status is success', () => {
    it('should call submit process with success status and check if jwt and thredresponse fields were included', done => {
      const data = {
        errorcode: '0',
        errormessage: PAYMENT_SUCCESS,
        jwt: 'testjwt',
        threedresponse: 'some threedresponse',
        baseamount: 'some amount',
        eci: 'test eci',
        enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });
        expect(document.getElementsByName('jwt')[0].getAttribute('value')).toEqual('testjwt');
        expect(document.getElementsByName('threedresponse')[0].getAttribute('value')).toEqual('some threedresponse');
        expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual('some amount');
        expect(document.getElementsByName('eci')[0].getAttribute('value')).toEqual('test eci');
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should call submit process TRANSACTION COMPLETE WITHOUT CALLING SUBMIT CALLBACK AND SUBKIT ING FORM (customeroutput + enrolled!==Y)', done => {
      const data = {
        errorcode: '0',
        errormessage: PAYMENT_SUCCESS,
        jwt: 'testjwt',
        baseamount: 'some amount',
        acsurl: 'some acs url',
        eci: 'test eci',
        enrolled: Enrollment.AUTHENTICATION_UNAVAILABLE,
        threedresponse: 'some threedresponse',
        customeroutput: CustomerOutput.THREEDREDIRECT,
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });
        expect(document.getElementsByName('jwt')[0].getAttribute('value')).toEqual('testjwt');
        expect(document.getElementsByName('threedresponse')[0].getAttribute('value')).toEqual('some threedresponse');
        expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual('some amount');
        expect(document.getElementsByName('eci')[0].getAttribute('value')).toEqual('test eci');
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });
  });

  describe('when different requestypedscription have been set', () => {
    beforeEach(() => {
      when(configProvider.getConfig$()).thenReturn(
        of({
          jwt: jwt,
          formId: 'st-form',
          datacenterurl: 'test',
          origin: 'testorigin',
          styles: {
            controlFrame: {
              'background-color-input': 'AliceBlue',
            },
          },
          submitFields: [],
          submitOnSuccess: true,
          submitOnCancel: true,
          submitOnError: true,
        } as IConfig)
      );
    });

    it(`should not submit form if requesttypedescription is equal ${RequestType.WALLETVERIFY}`, done => {
      const data = {
        errorcode: '0',
        errormessage: PAYMENT_SUCCESS,
        jwt: 'testjwt',
        requesttypedescription: RequestType.WALLETVERIFY,
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });
        // @ts-ignore
        expect(commonFrames.isFormSubmitted).toEqual(false);
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });

    it(`should not submit form if requesttypedescription is equal ${RequestType.JSINIT}`, done => {
      const data = {
        errorcode: '0',
        errormessage: PAYMENT_SUCCESS,
        jwt: 'testjwt',
        requesttypedescription: RequestType.JSINIT,
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });
        // @ts-ignore
        expect(commonFrames.isFormSubmitted).toEqual(false);
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should submit form if requesttypedescription is equal SOME_OTHER_DESC', done => {
      const data = {
        errorcode: '0',
        errormessage: PAYMENT_SUCCESS,
        jwt: 'testjwt',
        requesttypedescription: 'SOME_OTHER_DESC',
      };

      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        });
        // @ts-ignore
        expect(commonFrames.isFormSubmitted).toEqual(true);
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data,
        },
        EventScope.ALL_FRAMES
      );
    });
  });

  describe('when TRANSACTION_COMPLETE event has been called and hidden fields were attached', () => {
    it('should remove all existing hidden inputs except defined by merchant and replace with new ones based on submitFields', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(() => {
        expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual('10.00');
        expect(document.getElementsByName('somefield1')[0].getAttribute('value')).toEqual('somefield1');
        expect(document.getElementsByName('somefield2')[0].getAttribute('value')).toEqual('somefield2');
        expect(document.getElementsByName('test-field-1')[0].id).toEqual('test-field-1');
        expect(document.getElementsByName('test-field-2')[0].id).toEqual('test-field-2');
        expect(document.getElementsByName('eci')[0]).toEqual(undefined);

        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '60022',
            errormessage: 'An error occured',
            jwt: 'testjwt',
            baseamount: '10.00',
          },
        },
        EventScope.ALL_FRAMES
      );
    });
  });

  describe('when event has been called on Merchant fields', () => {
    const event: Event = new Event('input');

    beforeEach(() => {
      DomMethods.parseForm = jest.fn().mockReturnValueOnce({ test: 'testValue' });
    });

    it('should call message bus UPDATE_MERCHANT_FIELDS event on input', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.UPDATE_MERCHANT_FIELDS)).subscribe(event => {
        expect(event.data).toEqual({ test: 'testValue' });
        done();
      });
      document.getElementById('test-field-1').dispatchEvent(event);
      document.getElementById('test-field-2').dispatchEvent(event);
    });
  });

  describe('when walletsource property from PaymentRequest equals APPLEPAY', () => {
    beforeEach(() => {
      when(localStorage.select(anyFunction())).thenReturn(of('true'));
    });

    it('should call submit process with cancel status and check if jwt, thredresponse and other defined fields were not included', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
        expect(event).toEqual({
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '0',
            errormessage: PAYMENT_SUCCESS,
            jwt: 'testjwt',
            baseamount: 'some amount',
            walletsource: 'APPLEPAY',
          },
        });
        expect(document.getElementsByName('jwt')[0]).toEqual(undefined);
        done();
      });

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '0',
            errormessage: PAYMENT_SUCCESS,
            jwt: 'testjwt',
            baseamount: 'some amount',
            walletsource: 'APPLEPAY',
          },
        },
        EventScope.ALL_FRAMES
      );
    });
  });
});
