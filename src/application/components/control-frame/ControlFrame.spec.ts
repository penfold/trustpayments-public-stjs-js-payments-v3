import { anyString, anything, instance as mockInstance, mock, when } from 'ts-mockito';
import { EMPTY, of } from 'rxjs';
import { ThreeDProcess } from '../../core/services/three-d-verification/ThreeDProcess';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../core/shared/message-bus/SimpleMessageBus';
import { frameAllowedStyles } from '../../core/shared/frame/frame-const';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { IStyles } from '../../../shared/model/config/IStyles';
import { IConfig } from '../../../shared/model/config/IConfig';
import { NotificationService } from '../../../client/notification/NotificationService';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { StCodec } from '../../core/services/st-codec/StCodec';
import { VisaCheckoutClientStatus } from '../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { VisaCheckoutClient } from '../../../client/integrations/visa-checkout/VisaCheckoutClient';
import { Frame } from '../../core/shared/frame/Frame';
import { PaymentController } from '../../core/services/payments/PaymentController';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { IUpdateJwt } from '../../core/models/IUpdateJwt';
import { PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../core/models/constants/Translations';
import { Translator } from '../../core/shared/translator/Translator';
import { FormState } from '../../core/models/constants/FormState';
import { FraudControlService } from '../../core/services/fraud-control/FraudControlService';
import { EventScope } from '../../core/models/constants/EventScope';
import { ApplePayClient } from '../../../integrations/apple-pay/client/ApplePayClient';
import { ControlFrame } from './ControlFrame';
import spyOn = jest.spyOn;

jest.mock('./../../core/shared/payment/Payment');

describe('ControlFrame', () => {
  const { data, instance, messageBusEvent, messageBus } = controlFrameFixture();

  beforeEach(() => {
    // @ts-ignore
    instance.messageBus.subscribeType = jest.fn().mockImplementationOnce((event, callback) => {
      callback(data);
    });
  });

  describe('ControlFrame.onFormFieldStateChange()', () => {
    const field: IFormFieldState = {
      validity: false,
      value: '',
    };
    const data: IFormFieldState = {
      validity: true,
      value: '411111111',
    };

    beforeEach(() => {
      // @ts-ignore
      ControlFrame.setFormFieldValidity(field, data);
      // @ts-ignore
      ControlFrame.setFormFieldValue(field, data);
    });

    it('should set field properties: validity and value', () => {
      expect(field.validity).toEqual(true);
      expect(field.value).toEqual('411111111');
    });
  });

  describe('initChangeCardNumberEvent()', () => {
    it('should call _onCardNumberStateChange when CHANGE_CARD_NUMBER event has been called', () => {
      // @ts-ignore
      ControlFrame.setFormFieldValue = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_CARD_NUMBER;
      // @ts-ignore
      instance.formFieldChangeEvent(messageBusEvent.type, instance.formFields.cardNumber);
      // @ts-ignore
      expect(ControlFrame.setFormFieldValue).toHaveBeenCalled();
    });
  });

  describe('onExpirationDateStateChange()', () => {
    it('should call _onExpirationDateStateChange when CHANGE_EXPIRATION_DATE event has been called', () => {
      // @ts-ignore
      ControlFrame.setFormFieldValue = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_EXPIRATION_DATE;
      // @ts-ignore
      instance.formFieldChangeEvent(messageBusEvent.type, instance.formFields.expirationDate);
      // @ts-ignore
      expect(ControlFrame.setFormFieldValue).toHaveBeenCalled();
    });
  });

  describe('onSecurityCodeStateChange()', () => {
    it('should call _onSecurityCodeStateChange when CHANGE_SECURITY_CODE event has been called', () => {
      // @ts-ignore
      ControlFrame.setFormFieldValue = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_SECURITY_CODE;
      // @ts-ignore
      instance.formFieldChangeEvent(messageBusEvent.type, instance.formFields.securityCode);
      // @ts-ignore
      expect(ControlFrame.setFormFieldValue).toHaveBeenCalled();
    });
  });

  describe('initUpdateMerchantFieldsEvent()', () => {
    it('should call _storeMerchantData when UPDATE_MERCHANT_FIELDS event has been called', () => {
      // @ts-ignore
      instance.updateMerchantFields = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS;
      // @ts-ignore
      instance.updateMerchantFieldsEvent();
      // @ts-ignore
      expect(instance.updateMerchantFields).toHaveBeenCalled();
    });
  });

  describe('processPayment', () => {
    const { instance } = controlFrameFixture();
    const data = {
      errorcode: '40005',
      errormessage: 'some error message',
    };

    beforeEach(() => {
      // @ts-ignore
      instance.notification.success = jest.fn();
      // @ts-ignore
      instance.notification.error = jest.fn();
      // @ts-ignore
      instance.notification.cancel = jest.fn();
      // @ts-ignore
      instance.validation = {
        blockForm: jest.fn(),
      };
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
    });

    describe('when payment is processed successfully', () => {
      beforeEach(() => {
        // @ts-ignore
        instance.payment = {
          processPayment: jest.fn().mockResolvedValueOnce(undefined),
        };
      });

      it('should call notification success', async () => {
        // @ts-ignore
        await instance.processPayment(data);
        // @ts-ignore
        expect(instance.notification.success).toHaveBeenCalledWith(PAYMENT_SUCCESS);
      });

      it('should block form', async () => {
        // @ts-ignore
        await instance.processPayment(data);
        // @ts-ignore
        expect(instance.validation.blockForm).toHaveBeenCalledWith(FormState.COMPLETE);
      });

      it('should publish exposed event', async () => {
        // @ts-ignore
        await instance.processPayment(data);
        // @ts-ignore
        expect(instance.messageBus.publish).toHaveBeenCalledWith(
          {
            type: PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED,
            data: { name: 'CARD' },
          }, EventScope.EXPOSED);
      });
    });

    describe('when payment is not processed successfully', () => {
      beforeEach(()=>{
        // @ts-ignore
        instance.payment = {
          processPayment: jest.fn().mockRejectedValueOnce(undefined),
        };
      })

      it('should call notification error', async () => {
        // @ts-ignore
        await instance.processPayment(data);

        // @ts-ignore
        expect(instance.notification.error).toHaveBeenCalledWith(PAYMENT_ERROR);
      });

      it('should unblock form', async () => {
        // @ts-ignore
        await instance.processPayment(data);

        // @ts-ignore
        expect(instance.validation.blockForm).toHaveBeenCalledWith(FormState.AVAILABLE);
      });

      it('should publish exposed event', async () => {
        // @ts-ignore
        await instance.processPayment(data);
        // @ts-ignore
        expect(instance.messageBus.publish).toHaveBeenCalledWith(
          {
            type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
            data: { name: 'CARD' },
          }, EventScope.EXPOSED);
      });
    });
  });

  describe('storeMerchantData', () => {
    const { instance } = controlFrameFixture();
    const data = 'some data';

    beforeEach(() => {
      // @ts-ignore
      instance.updateMerchantFields(data);
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
    });

    it('should set _merchantFormData', () => {
      // @ts-ignore
      expect(instance.merchantFormData).toEqual(data);
    });
  });

  describe('getPan()', () => {
    // @ts-ignore
    instance.params = {
      jwt:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw',
    };

    // @ts-ignore
    instance.frame.parseUrl = jest.fn().mockReturnValueOnce({
      jwt:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw',
    });

    it('should return pan from jwt', () => {
      // @ts-ignore
      expect(instance.getPanFromJwt(['jwt', 'gatewayUrl'])).toEqual('3089500000000000021');
    });
  });

  describe('updateJwtEvent', () => {
    it('calls StCodec.updateJwt() on UPDATE_JWT event', () => {
      const updateJwtSpy = spyOn(StCodec, 'updateJwt');

      messageBus.publish<IUpdateJwt>({ type: PUBLIC_EVENTS.UPDATE_JWT, data: { newJwt: 'foobar' } });

      expect(updateJwtSpy).toHaveBeenCalledWith('foobar');
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
  const fraudControlServiceMock: FraudControlService = mock(FraudControlService);
  const threeDProcess: ThreeDProcess = mock(ThreeDProcess);
  const messageBus: IMessageBus = new SimpleMessageBus();
  const frame: Frame = mock(Frame);
  const jwtDecoderMock: JwtDecoder = mock(JwtDecoder);
  const visaCheckoutClientMock: VisaCheckoutClient = mock(VisaCheckoutClient);
  const applePayClientMock: ApplePayClient = mock(ApplePayClient);
  const paymentControllerMock: PaymentController = mock(PaymentController);
  const translator: Translator = mock(Translator);
  const controlFrame: IStyles[] = [
    {
      controlFrame: {
        'color-body': '#fff',
      },
    },
  ];

  when(communicator.whenReceive(anyString())).thenReturn({
    thenRespond: () => undefined,
  });
  when(configProvider.getConfig$()).thenReturn(of({ jwt: JWT } as IConfig));
  when(threeDProcess.init$()).thenReturn(EMPTY);
  when(frame.parseUrl()).thenReturn({
    locale: 'en_GB',
    jwt: JWT,
    styles: controlFrame,
  });
  when(frame.getAllowedParams()).thenReturn(['locale', 'origin', 'styles']);
  when(frame.getAllowedStyles()).thenReturn(frameAllowedStyles);
  when(jwtDecoderMock.decode(anything())).thenReturn({
    payload: {
      baseamount: '1000',
      accounttypedescription: 'ECOM',
      currencyiso3a: 'GBP',
      sitereference: 'test_james38641',
      locale: 'en_GB',
      pan: '3089500000000000021',
      expirydate: '01/22',
    },
  });
  when(visaCheckoutClientMock.init$()).thenReturn(of(VisaCheckoutClientStatus.SUCCESS));

  const instance = new ControlFrame(
    mockInstance(localStorage),
    mockInstance(communicator),
    mockInstance(configProvider),
    mockInstance(notification),
    mockInstance(fraudControlServiceMock),
    mockInstance(threeDProcess),
    messageBus,
    mockInstance(frame),
    mockInstance(jwtDecoderMock),
    mockInstance(visaCheckoutClientMock),
    mockInstance(applePayClientMock),
    mockInstance(paymentControllerMock),
    mockInstance(translator)
  );
  const messageBusEvent = {
    type: '',
  };
  const data = {
    validity: true,
    value: 'test value',
  };

  StCodec.jwt = JWT;

  return { data, instance, messageBusEvent, messageBus };
}
