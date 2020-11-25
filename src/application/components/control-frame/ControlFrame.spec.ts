import { ControlFrame } from './ControlFrame';
import { StCodec } from '../../core/services/st-codec/StCodec.class';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { mock, instance as mockInstance, when, anyString, anything } from 'ts-mockito';
import { NotificationService } from '../../../client/notification/NotificationService';
import { Cybertonica } from '../../core/integrations/cybertonica/Cybertonica';
import { CardinalCommerce } from '../../core/integrations/cardinal-commerce/CardinalCommerce';
import { IConfig } from '../../../shared/model/config/IConfig';
import { EMPTY, of } from 'rxjs';
import { Store } from '../../core/store/Store';
import { ConfigService } from '../../../shared/services/config-service/ConfigService';
import { Frame } from '../../core/shared/frame/Frame';
import { MessageBusMock } from '../../../testing/mocks/MessageBusMock';
import { IStyles } from '../../../shared/model/config/IStyles';
import { frameAllowedStyles } from '../../core/shared/frame/frame-const';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';

jest.mock('./../../core/shared/payment/Payment');

describe('ControlFrame', () => {
  const { data, instance, messageBusEvent } = controlFrameFixture();

  beforeEach(() => {
    // @ts-ignore
    instance._messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
      callback(data);
    });
  });

  describe('ControlFrame._onFormFieldStateChange()', () => {
    const field: IFormFieldState = {
      validity: false,
      value: ''
    };
    const data: IFormFieldState = {
      validity: true,
      value: '411111111'
    };

    beforeEach(() => {
      // @ts-ignore
      ControlFrame._setFormFieldValidity(field, data);
      // @ts-ignore
      ControlFrame._setFormFieldValue(field, data);
    });

    it('should set field properties: validity and value', () => {
      expect(field.validity).toEqual(true);
      expect(field.value).toEqual('411111111');
    });
  });

  describe('_initChangeCardNumberEvent()', () => {
    it('should call _onCardNumberStateChange when CHANGE_CARD_NUMBER event has been called', () => {
      // @ts-ignore
      ControlFrame._setFormFieldValue = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_CARD_NUMBER;
      // @ts-ignore
      instance._formFieldChangeEvent(messageBusEvent.type, instance._formFields.cardNumber);
      // @ts-ignore
      expect(ControlFrame._setFormFieldValue).toHaveBeenCalled();
    });
  });

  describe('_onExpirationDateStateChange()', () => {
    it('should call _onExpirationDateStateChange when CHANGE_EXPIRATION_DATE event has been called', () => {
      // @ts-ignore
      ControlFrame._setFormFieldValue = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_EXPIRATION_DATE;
      // @ts-ignore
      instance._formFieldChangeEvent(messageBusEvent.type, instance._formFields.expirationDate);
      // @ts-ignore
      expect(ControlFrame._setFormFieldValue).toHaveBeenCalled();
    });
  });

  describe('_onSecurityCodeStateChange()', () => {
    it('should call _onSecurityCodeStateChange when CHANGE_SECURITY_CODE event has been called', () => {
      // @ts-ignore
      ControlFrame._setFormFieldValue = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_SECURITY_CODE;
      // @ts-ignore
      instance._formFieldChangeEvent(messageBusEvent.type, instance._formFields.securityCode);
      // @ts-ignore
      expect(ControlFrame._setFormFieldValue).toHaveBeenCalled();
    });
  });

  describe('_initUpdateMerchantFieldsEvent()', () => {
    it('should call _storeMerchantData when UPDATE_MERCHANT_FIELDS event has been called', () => {
      // @ts-ignore
      instance._updateMerchantFields = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS;
      // @ts-ignore
      instance._updateMerchantFieldsEvent();
      // @ts-ignore
      expect(instance._updateMerchantFields).toHaveBeenCalled();
    });
  });

  describe('_initResetJwtEvent()', () => {
    const obj = { data: { newJwt: 'some jwt' } };

    it('should call _initResetJwtEvent when RESET_JWT event has been called', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest
        .fn()
        .mockImplementationOnce((even, callback) => {
          callback();
        })
        .mockImplementationOnce((even, callback) => {
          callback(obj);
        });
      // @ts-ignore
      ControlFrame._resetJwt = jest.fn();

      // @ts-ignore
      instance._resetJwtEvent();
      // @ts-ignore
      expect(ControlFrame._resetJwt).toHaveBeenCalled();
    });
  });

  // TODO: get know how handle this promise

  describe('_processPayment', () => {
    const { instance } = controlFrameFixture();
    const data = {
      errorcode: '40005',
      errormessage: 'some error message'
    };

    beforeEach(() => {
      // @ts-ignore
      instance._notification.success = jest.fn();
      // @ts-ignore
      instance._notification.error = jest.fn();
      // @ts-ignore
      instance._validation.blockForm = jest.fn();
    });

    it('should call notification success when promise is resolved', async () => {
      // @ts-ignore
      instance._payment.processPayment = jest.fn().mockResolvedValueOnce(new Promise(resolve => resolve(undefined)));
      // @ts-ignore
      instance._processPayment(data);
    });

    it('should call notification error when promise is rejected', async () => {
      // @ts-ignore
      instance._payment.processPayment = jest.fn().mockRejectedValueOnce(new Promise(rejected => rejected()));
      // @ts-ignore
      instance._processPayment(data);
    });
  });

  describe('_storeMerchantData', () => {
    const { instance } = controlFrameFixture();
    const data = 'some data';

    beforeEach(() => {
      // @ts-ignore
      instance._updateMerchantFields(data);
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
    });

    it('should set _merchantFormData', () => {
      // @ts-ignore
      expect(instance._merchantFormData).toEqual(data);
    });
  });

  describe('_onUpdateJWT', () => {
    beforeEach(() => {
      StCodec.jwt = '1234';
      StCodec.originalJwt = '56789';
      // @ts-ignore
      ControlFrame._updateJwt('997');
    });

    it('should update jwt and originalJwt', () => {
      expect(StCodec.jwt).toEqual('997');
      expect(StCodec.originalJwt).toEqual('997');
    });
  });

  describe('_getPan()', () => {
    // @ts-ignore
    instance.params = {
      jwt:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw'
    };

    // @ts-ignore
    instance._frame.parseUrl = jest.fn().mockReturnValueOnce({
      jwt:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw'
    });

    it('should return pan from jwt', () => {
      // @ts-ignore
      expect(instance._getPanFromJwt(['jwt', 'gatewayUrl'])).toEqual('3089500000000000021');
    });
  });
});

function controlFrameFixture() {
  const JWT =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw';
  const localStorage: BrowserLocalStorage = mock(BrowserLocalStorage);
  const communicator: InterFrameCommunicator = mock(InterFrameCommunicator);
  const configProvider: ConfigProvider = mock<ConfigProvider>();
  const notification: NotificationService = mock(NotificationService);
  const cybertonica: Cybertonica = mock(Cybertonica);
  const cardinalCommerce: CardinalCommerce = mock(CardinalCommerce);
  const configService: ConfigService = mock(ConfigService);
  const messageBus: MessageBus = (new MessageBusMock() as unknown) as MessageBus;
  const frame: Frame = mock(Frame);
  const storeMock: Store = mock(Store);
  const jwtDecoderMock: JwtDecoder = mock(JwtDecoder);
  const controlFrame: IStyles[] = [
    {
      controlFrame: {
        'color-body': '#fff'
      }
    }
  ];

  when(communicator.whenReceive(anyString())).thenReturn({
    thenRespond: () => undefined
  });
  when(configProvider.getConfig$()).thenReturn(of({ jwt: JWT } as IConfig));
  when(cardinalCommerce.init(anything())).thenReturn(EMPTY);
  when(frame.parseUrl()).thenReturn({
    locale: 'en_GB',
    jwt: JWT,
    styles: controlFrame
  });
  when(frame.getAllowedParams()).thenReturn(['locale', 'origin', 'styles']);
  when(frame.getAllowedStyles()).thenReturn(frameAllowedStyles);
  when(jwtDecoderMock.decode(JWT)).thenReturn({
    payload: {
      baseamount: '1000',
      accounttypedescription: 'ECOM',
      currencyiso3a: 'GBP',
      sitereference: 'test_james38641',
      locale: 'en_GB',
      pan: '3089500000000000021',
      expirydate: '01/22'
    }
  });

  const instance = new ControlFrame(
    mockInstance(localStorage),
    mockInstance(communicator),
    mockInstance(configProvider),
    mockInstance(notification),
    mockInstance(cybertonica),
    mockInstance(cardinalCommerce),
    mockInstance(storeMock),
    mockInstance(configService),
    messageBus,
    mockInstance(frame),
    mockInstance(jwtDecoderMock)
  );
  const messageBusEvent = {
    type: ''
  };
  const data = {
    validity: true,
    value: 'test value'
  };

  StCodec.jwt = JWT;

  // @ts-ignore
  instance.init({ jwt: JWT } as IConfig);

  return { data, instance, messageBusEvent };
}
