import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { PAYMENT_CANCELLED, PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { EventScope } from '../../models/constants/EventScope';
import { ITranslator } from '../../shared/translator/ITranslator';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { PaymentStatus } from './PaymentStatus';
import { IPaymentResult } from './IPaymentResult';
import { PaymentResultHandler } from './PaymentResultHandler';

describe('PaymentResultHandler', () => {
  let messageBus: IMessageBus;
  let notificationServiceMock: NotificationService;
  let configProviderMock: ConfigProvider;
  let paymentResultHandler: PaymentResultHandler;
  let translatorMock: ITranslator;
  let googleAnalyticsMock: GoogleAnalytics;

  beforeEach(() => {
    messageBus = new SimpleMessageBus();
    notificationServiceMock = mock(NotificationService);
    configProviderMock = mock<ConfigProvider>();
    translatorMock = mock<ITranslator>();
    googleAnalyticsMock = mock(GoogleAnalytics);
    paymentResultHandler = new PaymentResultHandler(
      messageBus,
      instance(notificationServiceMock),
      instance(configProviderMock),
      instance(translatorMock),
      instance(googleAnalyticsMock),
    );

    when(translatorMock.translate('ok')).thenReturn('payment successful');
    when(translatorMock.translate('fail')).thenReturn('payment failed');
  });

  describe('handle()', () => {
    const resultData = { foo: 'bar', errormessage: 'ok' };
    const translatedResultData = { foo: 'bar', errormessage: 'payment successful' };

    let messageBusSpy: IMessageBus;

    beforeEach(() => {
      messageBusSpy = spy(messageBus);
    });

    it('handles SUCCESS result with submitOnSuccess set to false', () => {
      const result: IPaymentResult<typeof resultData> = { status: PaymentStatus.SUCCESS, data: resultData, paymentMethodName: 'Card' };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnSuccess: false }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.APPEND_FORM_DATA,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.success(PAYMENT_SUCCESS)).once();
    });

    it('handles SUCCESS result with submitOnSuccess set to true', () => {
      const result: IPaymentResult<typeof resultData> = { status: PaymentStatus.SUCCESS, data: resultData, paymentMethodName: 'Card' };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnSuccess: true }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.success(anything())).never();
    });

    it('handles CANCEL result with submitOnCancel set to false', () => {
      const result: IPaymentResult<typeof resultData> = { status: PaymentStatus.CANCEL, data: resultData, paymentMethodName: 'Card' };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnCancel: false }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.APPEND_FORM_DATA,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.cancel(PAYMENT_CANCELLED)).once();
    });

    it('handles CANCEL result with submitOnCancel set to true', () => {
      const result: IPaymentResult<typeof resultData> = { status: PaymentStatus.CANCEL, data: resultData, paymentMethodName: 'Card' };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnCancel: true }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.cancel(anything())).never();
    });

    it('handles FAILURE result with submitOnError set to false', () => {
      const errorMessage = 'fail';
      const result: IPaymentResult<typeof resultData> = {
        status: PaymentStatus.FAILURE,
        data: resultData,
        error: {
          message: errorMessage,
          code: 123,
        },
        paymentMethodName: 'Card',
      };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnError: false }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.APPEND_FORM_DATA,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.error('payment failed')).once();
    });

    it('handles FAILURE result with submitOnError set to true', () => {
      const errorMessage = 'fail';
      const result: IPaymentResult<typeof resultData> = {
        status: PaymentStatus.FAILURE,
        data: resultData,
        error: {
          message: errorMessage,
          code: 123,
        },
        paymentMethodName: 'Card',
      };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnError: true }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.error(anything())).never();
    });

    it('handles ERROR result with submitOnError set to false', () => {
      const errorMessage = 'fail';
      const result: IPaymentResult<typeof resultData> = {
        status: PaymentStatus.ERROR,
        data: resultData,
        error: {
          message: errorMessage,
          code: 123,
        },
        paymentMethodName: 'Card',
      };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnError: false }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.APPEND_FORM_DATA,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.error('payment failed')).once();
    });

    it('handles ERROR result with submitOnError set to true', () => {
      const errorMessage = 'fail';
      const result: IPaymentResult<typeof resultData> = {
        status: PaymentStatus.ERROR,
        data: resultData,
        error: {
          message: errorMessage,
          code: 123,
        },
        paymentMethodName: 'Card',
      };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnError: true }));

      paymentResultHandler.handle(result);

      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT,
            data: translatedResultData,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
      verify(notificationServiceMock.error(anything())).never();
    });

    it('displays default error notification if ERROR result has empty error property', () => {
      const result: IPaymentResult<typeof resultData> = { status: PaymentStatus.ERROR, data: resultData, paymentMethodName: 'Card' };
      when(configProviderMock.getConfig$()).thenReturn(of({ submitOnError: false }));

      paymentResultHandler.handle(result);

      verify(notificationServiceMock.error(PAYMENT_ERROR)).once();
    });
  });
});
