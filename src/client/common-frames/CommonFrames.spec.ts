import { CommonFrames } from './CommonFrames';
import { anything, instance as mockInstance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IConfig } from '../../shared/model/config/IConfig';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import {
  PAYMENT_CANCELLED,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS
} from '../../application/core/models/constants/Translations';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';

describe('CommonFrames', () => {
  const jwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw';
  let commonFrames: CommonFrames;
  let configProvider: ConfigProvider;
  let frame: Frame;
  let iframeFactory: IframeFactory;
  let jwtDecoder: JwtDecoder;
  let localStorage: BrowserLocalStorage;
  let messageBus: IMessageBus;

  beforeEach(() => {
    document.body.innerHTML =
      '<form id="st-form"><input type="text" name="test-field-1" id="test-field-1"/><input type="text" name="test-field-2" id="test-field-2"/></form>';
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
            'background-color-input': 'AliceBlue'
          }
        },
        submitFields: ['baseamount', 'eci'],
        submitOnSuccess: true
      } as IConfig)
    );

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

  it('should init control frame component and insert only one iframe into merchants form', () => {
    const iframe = document.getElementsByTagName('iframe');
    expect(iframe.length).toEqual(1);
    expect(iframe[0].getAttribute('id')).toEqual('st-control-frame-iframe');
  });

  it('should init merchant inputs listeners', () => {});

  it('should init transactionComplete listener', () => {});

  describe('submit process when payment has been cancelled', () => {
    it('should call submit process with cancel status and check if jwt and thredresponse fields were not included', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: 'cancelled',
              errormessage: PAYMENT_CANCELLED,
              jwt: 'testjwt',
              threedresponse: 'threedresponse'
            }
          });
          expect(document.getElementsByName('jwt')[0]).toEqual(undefined);
          expect(document.getElementsByName('threedresponse')[0]).toEqual(undefined);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: 'cancelled',
            errormessage: PAYMENT_CANCELLED,
            jwt: 'testjwt',
            threedresponse: 'threedresponse'
          }
        },
        true
      );
    });

    it('should call submit process with cancel status and check if jwt, thredresponse and other defined fields were not included', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: 'cancelled',
              errormessage: PAYMENT_CANCELLED,
              jwt: 'testjwt',
              threedresponse: 'threedresponse',
              baseamount: 'some amount',
              eci: 'test eci',
              enrolled: 'Y'
            }
          });
          expect(document.getElementsByName('jwt')[0]).toEqual(undefined);
          expect(document.getElementsByName('threedresponse')[0]).toEqual(undefined);
          expect(document.getElementsByName('baseamount')[0]).toEqual(undefined);
          expect(document.getElementsByName('eci')[0]).toEqual(undefined);
          expect(document.getElementsByName('enrolled')[0]).toEqual(undefined);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: 'cancelled',
            errormessage: PAYMENT_CANCELLED,
            jwt: 'testjwt',
            threedresponse: 'threedresponse',
            baseamount: 'some amount',
            eci: 'test eci',
            enrolled: 'Y'
          }
        },
        true
      );
    });
  });

  describe('submit process when payment status is error', () => {
    it('should call submit process with error status and check if jwt and thredresponse fields were included', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: '50003',
              errormessage: PAYMENT_ERROR,
              jwt: 'testjwt',
              threedresponse: 'some threedresponse',
              baseamount: 'some amount',
              eci: 'test eci',
              enrolled: 'Y'
            }
          });
          expect(document.getElementsByName('jwt')[0].getAttribute('value')).toEqual('testjwt');
          expect(document.getElementsByName('threedresponse')[0].getAttribute('value')).toEqual('some threedresponse');
          expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual('some amount');
          expect(document.getElementsByName('eci')[0].getAttribute('value')).toEqual('test eci');
          expect(document.getElementsByName('enrolled')[0]).toEqual(undefined);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '50003',
            errormessage: PAYMENT_ERROR,
            jwt: 'testjwt',
            threedresponse: 'some threedresponse',
            baseamount: 'some amount',
            eci: 'test eci',
            enrolled: 'Y'
          }
        },
        true
      );
    });

    it('should call submit process with 22000 error status and check if jwt and thredresponse fields were included', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: '22000',
              errormessage: PAYMENT_ERROR,
              jwt: 'testjwt',
              threedresponse: 'some threedresponse',
              baseamount: 'some amount',
              eci: 'test eci',
              enrolled: 'Y'
            }
          });
          expect(document.getElementsByName('jwt')[0].getAttribute('value')).toEqual('testjwt');
          expect(document.getElementsByName('threedresponse')[0].getAttribute('value')).toEqual('some threedresponse');
          expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual('some amount');
          expect(document.getElementsByName('eci')[0].getAttribute('value')).toEqual('test eci');
          expect(document.getElementsByName('enrolled')[0]).toEqual(undefined);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '22000',
            errormessage: PAYMENT_ERROR,
            jwt: 'testjwt',
            threedresponse: 'some threedresponse',
            baseamount: 'some amount',
            eci: 'test eci',
            enrolled: 'Y'
          }
        },
        true
      );
    });
  });

  describe('submit process when payment status is error', () => {
    it('should call submit process with success status and check if jwt and thredresponse fields were included', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: '0',
              errormessage: PAYMENT_SUCCESS,
              jwt: 'testjwt',
              threedresponse: 'some threedresponse',
              baseamount: 'some amount',
              eci: 'test eci',
              enrolled: 'Y'
            }
          });
          expect(document.getElementsByName('jwt')[0].getAttribute('value')).toEqual('testjwt');
          expect(document.getElementsByName('threedresponse')[0].getAttribute('value')).toEqual('some threedresponse');
          expect(document.getElementsByName('baseamount')[0].getAttribute('value')).toEqual('some amount');
          expect(document.getElementsByName('eci')[0].getAttribute('value')).toEqual('test eci');
          expect(document.getElementsByName('enrolled')[0]).toEqual(undefined);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '0',
            errormessage: PAYMENT_SUCCESS,
            jwt: 'testjwt',
            threedresponse: 'some threedresponse',
            baseamount: 'some amount',
            eci: 'test eci',
            enrolled: 'Y'
          }
        },
        true
      );
    });
  });

  describe('requestypedscription', () => {
    beforeEach(() => {
      when(configProvider.getConfig$()).thenReturn(
        of({
          jwt: jwt,
          formId: 'st-form',
          datacenterurl: 'test',
          origin: 'testorigin',
          styles: {
            controlFrame: {
              'background-color-input': 'AliceBlue'
            }
          },
          submitFields: ['baseamount', 'eci'],
          submitOnSuccess: true,
          submitOnCancel: true,
          submitOnError: true
        } as IConfig)
      );
    });

    it('should not submit form if requesttypedescription is equal WALLETVERIFY', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: '0',
              errormessage: PAYMENT_SUCCESS,
              jwt: 'testjwt',
              requesttypedescription: 'WALLETVERIFY'
            }
          });
          // @ts-ignore
          expect(commonFrames.isFormSubmitted).toEqual(false);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '0',
            errormessage: PAYMENT_SUCCESS,
            jwt: 'testjwt',
            requesttypedescription: 'WALLETVERIFY'
          }
        },
        true
      );
    });

    it('should not submit form if requesttypedescription is equal JSINIT', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: '0',
              errormessage: PAYMENT_SUCCESS,
              jwt: 'testjwt',
              requesttypedescription: 'JSINIT'
            }
          });
          // @ts-ignore
          expect(commonFrames.isFormSubmitted).toEqual(false);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '0',
            errormessage: PAYMENT_SUCCESS,
            jwt: 'testjwt',
            requesttypedescription: 'JSINIT'
          }
        },
        true
      );
    });

    it('should submit form if requesttypedescription is equal SOME_OTHER_DESC', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(event => {
          expect(event).toEqual({
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: '0',
              errormessage: PAYMENT_SUCCESS,
              jwt: 'testjwt',
              requesttypedescription: 'SOME_OTHER_DESC'
            }
          });
          // @ts-ignore
          expect(commonFrames.isFormSubmitted).toEqual(true);
          done();
        })
      );

      messageBus.publish(
        {
          type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
          data: {
            errorcode: '0',
            errormessage: PAYMENT_SUCCESS,
            jwt: 'testjwt',
            requesttypedescription: 'SOME_OTHER_DESC'
          }
        },
        true
      );
    });
  });

  describe('Merchant fields', () => {
    const event: Event = new Event('input');

    beforeEach(() => {
      DomMethods.parseForm = jest.fn().mockReturnValueOnce({ test: 'testValue' });
    });

    it('should call message bus UPDATE_MERCHANT_FIELDS event', done => {
      when(
        messageBus.pipe(ofType(PUBLIC_EVENTS.UPDATE_MERCHANT_FIELDS)).subscribe(event => {
          expect(event.data).toEqual({ test: 'testValue' });
          done();
        })
      );
      document.getElementById('test-field-1').dispatchEvent(event);
      document.getElementById('test-field-2').dispatchEvent(event);
    });
  });
});
