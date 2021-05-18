import { of } from 'rxjs';
import { anything, deepEqual, instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import {
  PAYMENT_CANCELLED,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS,
} from '../../../application/core/models/constants/Translations';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { Payment } from '../../../application/core/shared/payment/Payment';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { NotificationService } from '../../notification/NotificationService';
import { VisaCheckoutClient } from './VisaCheckoutClient';
import { VisaCheckoutClientStatus } from './VisaCheckoutClientStatus';

describe('VisaCheckoutClient', () => {
  let visaCheckoutClient: VisaCheckoutClient;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let messageBusMock: IMessageBus;
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

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    messageBusMock = mock<IMessageBus>();
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
    when(jwtDecoderMock.decode(anything())).thenReturn({
      payload: {
        requesttypedescriptions: ['AUTH'],
      },
    });
  });

  describe('init$()', () => {
    it(`should check ${VisaCheckoutClientStatus.SUCCESS} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
          data: {
            status: VisaCheckoutClientStatus.SUCCESS,
            data: {},
            merchantData: {},
          },
        })
      );
      when(paymentMock.processPayment(anything(), anything(), anything(), anything(), anything())).thenReturn(Promise.resolve({}));

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.SUCCESS);
        verify(notificationServiceMock.success(PAYMENT_SUCCESS)).once();
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK }), true)).once();

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.SUCCESS} callback with error form payment`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
          data: {
            status: VisaCheckoutClientStatus.SUCCESS,
            data: {},
            merchantData: {},
          },
        })
      );
      when(paymentMock.processPayment(anything(), anything(), anything(), anything(), anything())).thenReturn(Promise.reject());

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.SUCCESS_FAILED);
        verify(notificationServiceMock.error(PAYMENT_ERROR)).once();
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK }), true)).once();

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.ERROR} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
          data: {
            status: VisaCheckoutClientStatus.ERROR,
            data: {},
          },
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.ERROR);
        verify(notificationServiceMock.error(PAYMENT_ERROR)).once();
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK }), true)).once();

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.CANCEL} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
          data: {
            status: VisaCheckoutClientStatus.CANCEL,
            data: {},
          },
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.CANCEL);
        verify(notificationServiceMock.cancel(PAYMENT_CANCELLED)).once();
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK }), true)).once();
        verify(
          messageBusMock.publish(
            deepEqual({
              type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
              data: {
                errorcode: 'cancelled',
                errormessage: PAYMENT_CANCELLED,
              },
            }),
            true
          )
        ).once();

        done();
      });
    });

    it(`should check ${VisaCheckoutClientStatus.PRE_PAYMENT} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
          data: {
            status: VisaCheckoutClientStatus.PRE_PAYMENT,
            data: {},
          },
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe(VisaCheckoutClientStatus.PRE_PAYMENT);

        done();
      });
    });

    it(`should throw an error when unknown status provided`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
          data: {
            status: 'UNKNOWN' as VisaCheckoutClientStatus,
            data: {},
          },
        })
      );

      visaCheckoutClient.init$().subscribe(status => {
        expect(status).toBe('Unknown Visa Checkout status');

        done();
      });
    });
  });
});
