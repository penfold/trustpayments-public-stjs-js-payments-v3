import { IPaymentResult } from './IPaymentResult';
import { Service } from 'typedi';
import { PaymentStatus } from './PaymentStatus';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { PAYMENT_CANCELLED, PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { EventScope } from '../../models/constants/EventScope';

@Service()
export class PaymentResultHandler {
  constructor(
    private messageBus: IMessageBus,
    private notificationService: NotificationService,
    private configProvider: ConfigProvider
  ) {}

  handle<T>(result: IPaymentResult<T>): void {
    switch (result.status) {
      case PaymentStatus.SUCCESS:
        return this.handleSuccess(result);
      case PaymentStatus.CANCEL:
        return this.handleCancel(result);
      default:
        return this.handleFailureOrError(result);
    }
  }

  private handleSuccess<T>(result: IPaymentResult<T>): void {
    this.configProvider.getConfig$().subscribe(config => {
      if (config.submitOnSuccess) {
        this.messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: result.data },  EventScope.ALL_FRAMES);
        return;
      }

      this.notificationService.success(PAYMENT_SUCCESS);
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

      this.notificationService.cancel(PAYMENT_CANCELLED);
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

      this.notificationService.error(errorMessage);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK, data: result.data },  EventScope.ALL_FRAMES);
    });
  }
}
