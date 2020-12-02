import { of } from 'rxjs';
import { anything, capture, instance as mockInstance, mock, spy, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import {
  PAYMENT_CANCELLED,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS
} from '../../../application/core/models/constants/Translations';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { Payment } from '../../../application/core/shared/payment/Payment';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { NotificationService } from '../../notification/NotificationService';
import { IVisaCheckoutClientStatus } from './IVisaCheckoutClientStatus';
import { VisaCheckoutClient } from './VisaCheckoutClient';
import { VisaCheckoutClientStatus } from './VisaCheckoutClientStatus';

describe('VisaCheckoutClient', () => {
  let visaCheckoutClient: VisaCheckoutClient;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let messageBusMock: MessageBus;
  let configProviderMock: ConfigProvider;
  let jwtDecoderMock: JwtDecoder;
  let notificationServiceMock: NotificationService;
  let paymentMock: Payment;

  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
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

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    messageBusMock = mock(MessageBus);
    configProviderMock = mock<ConfigProvider>();
    jwtDecoderMock = mock(JwtDecoder);
    notificationServiceMock = mock(NotificationService);
    paymentMock = mock(Payment);

    visaCheckoutClient = new VisaCheckoutClient(
      mockInstance(interFrameCommunicatorMock),
      mockInstance(messageBusMock),
      mockInstance(configProviderMock),
      mockInstance(jwtDecoderMock),
      mockInstance(notificationServiceMock),
      mockInstance(paymentMock)
    );

    when(configProviderMock.getConfig$()).thenReturn(of(configMock));
    when(messageBusMock.pipe(anything())).thenReturn(
      of({
        data: {
          newJwt: ''
        }
      })
    );
    when(jwtDecoderMock.decode(anything())).thenReturn({
      payload: {
        requesttypedescriptions: ['AUTH']
      }
    });
    visaCheckoutClient.watchConfigAndJwtUpdates();
  });

  describe('init$()', () => {
    it(`should check ${VisaCheckoutClientStatus.SUCCESS} callback`, done => {
      when(interFrameCommunicatorMock.query(anything(), anything())).thenReturn(
        new Promise(resolve => {
          resolve({
            status: VisaCheckoutClientStatus.SUCCESS,
            data: {},
            merchantData: {}
          } as IVisaCheckoutClientStatus);
        })
      );
      when(paymentMock.processPayment(anything(), anything(), anything())).thenReturn(Promise.resolve({}));

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.SUCCESS);
        expect(capture(notificationServiceMock.success).first()).toEqual([PAYMENT_SUCCESS]);
        expect(capture(messageBusMock.publish).first()).toEqual([
          { type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK },
          true
        ]);

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.SUCCESS} callback with error form payment`, done => {
      when(interFrameCommunicatorMock.query(anything(), anything())).thenReturn(
        new Promise(resolve => {
          resolve({
            status: VisaCheckoutClientStatus.SUCCESS,
            data: {},
            merchantData: {}
          } as IVisaCheckoutClientStatus);
        })
      );
      when(paymentMock.processPayment(anything(), anything(), anything())).thenReturn(Promise.reject());

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.SUCCESS_FAILED);
        expect(capture(notificationServiceMock.error).first()).toEqual([PAYMENT_ERROR]);
        expect(capture(messageBusMock.publish).first()).toEqual([
          { type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK },
          true
        ]);

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.ERROR} callback`, done => {
      when(interFrameCommunicatorMock.query(anything(), anything())).thenReturn(
        new Promise(resolve => {
          resolve({
            status: VisaCheckoutClientStatus.ERROR,
            data: {}
          } as IVisaCheckoutClientStatus);
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.ERROR);
        expect(capture(notificationServiceMock.error).first()).toEqual([PAYMENT_ERROR]);
        expect(capture(messageBusMock.publish).first()).toEqual([
          { type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK },
          true
        ]);

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.CANCEL} callback`, done => {
      when(interFrameCommunicatorMock.query(anything(), anything())).thenReturn(
        new Promise(resolve => {
          resolve({
            status: VisaCheckoutClientStatus.CANCEL,
            data: {}
          } as IVisaCheckoutClientStatus);
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.CANCEL);
        expect(capture(notificationServiceMock.cancel).first()).toEqual([PAYMENT_CANCELLED]);
        expect(capture(messageBusMock.publish).first()).toEqual([
          {
            type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK
          },
          true
        ]);
        expect(capture(messageBusMock.publish).second()).toEqual([
          {
            type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
            data: {
              errorcode: 'cancelled',
              errormessage: PAYMENT_CANCELLED
            }
          },
          true
        ]);

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.PRE_PAYMENT} callback`, done => {
      when(interFrameCommunicatorMock.query(anything(), anything())).thenReturn(
        new Promise(resolve => {
          resolve({
            status: VisaCheckoutClientStatus.PRE_PAYMENT,
            data: {}
          } as IVisaCheckoutClientStatus);
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.PRE_PAYMENT);

        done();
      });
    });

    it(`should throw an error when unknown status provided`, done => {
      when(interFrameCommunicatorMock.query(anything(), anything())).thenReturn(
        new Promise(resolve => {
          resolve({
            status: 'UNKNOWN' as VisaCheckoutClientStatus,
            data: {}
          } as IVisaCheckoutClientStatus);
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe('Unknown Visa Checkout status');

        done();
      });
    });
  });
});
