import { of } from 'rxjs';
import { anything, deepEqual, instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { NotificationService } from '../../notification/NotificationService';
import { ApplePayNotificationService } from './apple-pay-notification-service/ApplePayNotificationService';
import { ApplePayClient } from './ApplePayClient';
import { ApplePayClientStatus } from './ApplePayClientStatus';
import { IApplePayClientStatus } from './IApplePayClientStatus';
import { ApplePayPaymentService } from './apple-pay-payment-service/ApplePayPaymentService';

describe.skip('ApplePayClient', () => {
  let applePayClient: ApplePayClient;
  let configProviderMock: ConfigProvider;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let messageBusMock: IMessageBus;
  let notificationServiceMock: NotificationService;
  let browserLocalStorageMock: BrowserLocalStorage;
  let applePayNotificationService: ApplePayNotificationService;
  let applePayPaymentService: ApplePayPaymentService;

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
    configProviderMock = mock<ConfigProvider>();
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    messageBusMock = mock<IMessageBus>();
    notificationServiceMock = mock(NotificationService);
    browserLocalStorageMock = mock(BrowserLocalStorage);
    applePayNotificationService = mock(ApplePayNotificationService);
    applePayPaymentService = mock(ApplePayPaymentService);

    applePayClient = new ApplePayClient(
      mockInstance(applePayNotificationService),
      mockInstance(applePayPaymentService),
      mockInstance(configProviderMock),
      mockInstance(interFrameCommunicatorMock),
      mockInstance(browserLocalStorageMock),
      mockInstance(messageBusMock)
    );

    when(configProviderMock.getConfig$()).thenReturn(of(configMock));
    when(messageBusMock.publish(anything())).thenCall(() => {});
  });

  describe('init$()', () => {
    it(`should check ${ApplePayClientStatus.SUCCESS} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.SUCCESS,
            details: {
              errorCode: ApplePayClientErrorCode.SUCCESS,
              errorMessage: 'SUCCESS'
            }
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(status => {
        expect(status).toBe(ApplePayClientStatus.SUCCESS);
        verify(browserLocalStorageMock.setItem('completePayment', 'true')).once();
        verify(applePayNotificationService.notification(ApplePayClientErrorCode.SUCCESS, 'SUCCESS')).once();

        done();
      });
    });

    it(`should check ${ApplePayClientStatus.ERROR} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.ERROR,
            details: {
              errorCode: ApplePayClientErrorCode.ERROR,
              errorMessage: 'ERROR'
            }
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(status => {
        expect(status).toBe(ApplePayClientStatus.ERROR);
        verify(browserLocalStorageMock.setItem('completePayment', 'false')).once();
        verify(applePayNotificationService.notification(ApplePayClientErrorCode.ERROR, 'ERROR')).once();
        verify(
          messageBusMock.publish(
            deepEqual({
              type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK
            }),
            true
          )
        ).once();

        done();
      });
    });

    it(`should check ${ApplePayClientStatus.CANCEL} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.CANCEL,
            details: {
              errorCode: ApplePayClientErrorCode.CANCEL,
              errorMessage: 'CANCEL'
            }
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(status => {
        expect(status).toBe(ApplePayClientStatus.CANCEL);
        verify(applePayNotificationService.notification(ApplePayClientErrorCode.CANCEL, 'CANCEL')).once();
        verify(
          messageBusMock.publish(
            deepEqual({
              type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK
            }),
            true
          )
        ).once();
        verify(
          messageBusMock.publish(
            deepEqual({
              type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
              data: {}
            }),
            true
          )
        ).once();

        done();
      });
    });

    it(`should check ${ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS,
            details: {}
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(status => {
        expect(status).toBe(ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS);

        done();
      });
    });

    it(`should check ${ApplePayClientStatus.VALIDATE_MERCHANT_ERROR} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
            details: {}
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(status => {
        expect(status).toBe(ApplePayClientStatus.VALIDATE_MERCHANT_ERROR);

        done();
      });
    });

    it(`should check ${ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD,
            details: {}
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(status => {
        expect(status).toBe(ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD);

        done();
      });
    });

    it(`should check ${ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET} callback`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET,
            details: {
              errorCode: ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET,
              errorMessage: 'NO_ACTIVE_CARDS_IN_WALLET'
            }
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(status => {
        expect(status).toBe(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);

        done();
      });
    });

    it(`should throw UNKNOWN error when unknown parameter passed`, done => {
      when(messageBusMock.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
          data: {
            status: 'No one knows' as ApplePayClientStatus,
            details: undefined
          } as IApplePayClientStatus
        })
      );

      applePayClient.init$().subscribe(
        () => {},
        err => {
          expect(err).toBe('Unknown Apple Pay status');

          done();
        }
      );
    });
  });
});
