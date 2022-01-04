import { Service } from 'typedi';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { PAYMENT_CANCELLED, PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { EventScope } from '../../models/constants/EventScope';
import { ITranslator } from '../../shared/translator/ITranslator';
import { GAEventType } from '../../integrations/google-analytics/events';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { PaymentStatus } from './PaymentStatus';
import { IPaymentResult } from './IPaymentResult';

@Service()
export class PaymentResultHandler {
  constructor(
    private messageBus: IMessageBus,
    private notificationService: NotificationService,
    private configProvider: ConfigProvider,
    private translator: ITranslator,
    private googleAnalytics: GoogleAnalytics,
  ) {}

  handle<T>(result: IPaymentResult<T>): void {
    const translatedResult = this.translateResult(result);

    switch (result.status) {
      case PaymentStatus.SUCCESS:
        return this.handleSuccess(translatedResult);
      case PaymentStatus.CANCEL:
        return this.handleCancel(translatedResult);
      default:
        return this.handleFailureOrError(translatedResult);
    }
  }

  private handleSuccess<T>(result: IPaymentResult<T>): void {
    this.configProvider.getConfig$().subscribe(config => {
      if (config.submitOnSuccess) {
        this.messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: result.data },  EventScope.ALL_FRAMES);
        return;
      }

      this.messageBus.publish({
        type: PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED,
        data: { name: result.paymentMethodName },
      }, EventScope.EXPOSED);

      this.googleAnalytics.sendGaData('event', result.paymentMethodName, GAEventType.COMPLETE, `Payment by ${result.paymentMethodName} completed`);

      this.notificationService.success(PAYMENT_SUCCESS);
      this.messageBus.publish({ type: PUBLIC_EVENTS.APPEND_FORM_DATA, data: result.data },  EventScope.ALL_FRAMES);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
    });
  }

  private handleCancel<T>(result: IPaymentResult<T>): void {
    this.configProvider.getConfig$().subscribe(config => {
      if (config.submitOnCancel) {
        this.messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: result.data },  EventScope.ALL_FRAMES);
        return;
      }

      this.messageBus.publish({
        type: PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED,
        data: { name: result.paymentMethodName },
      }, EventScope.EXPOSED);

      this.googleAnalytics.sendGaData('event', result.paymentMethodName, GAEventType.FAIL, `Payment by ${result.paymentMethodName} failed`);

      this.notificationService.cancel(PAYMENT_CANCELLED);
      this.messageBus.publish({ type: PUBLIC_EVENTS.APPEND_FORM_DATA, data: result.data },  EventScope.ALL_FRAMES);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
    });
  }

  private handleFailureOrError<T>(result: IPaymentResult<T>): void {
    const errorMessage = result.error ? result.error.message : PAYMENT_ERROR;

    this.configProvider.getConfig$().subscribe(config => {
      if (config.submitOnError) {
        this.messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: result.data },  EventScope.ALL_FRAMES);
        return;
      }

      this.messageBus.publish({
        type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
        data: { name: result.paymentMethodName },
      }, EventScope.EXPOSED);

      this.googleAnalytics.sendGaData('event', result.paymentMethodName, GAEventType.FAIL, `Payment by ${result.paymentMethodName} failed`);

      this.notificationService.error(errorMessage);
      this.messageBus.publish({ type: PUBLIC_EVENTS.APPEND_FORM_DATA, data: result.data },  EventScope.ALL_FRAMES);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
    });
  }

  private translateResult<T>(result: IPaymentResult<T>): IPaymentResult<T> {
    let data = result.data;
    const error = result.error;

    if (this.hasErrorMessageProperty(data)) {
      data = { ...data, errormessage: this.translator.translate(data.errormessage) };
    }

    const translatedResult = { ...result, data };

    if (error) {
      translatedResult.error = { ...error, message: this.translator.translate(error.message) };
    }

    return translatedResult;
  }

  private hasErrorMessageProperty(data: unknown): data is { errormessage: string } {
    return typeof data === 'object' && 'errormessage' in data;
  }
}
