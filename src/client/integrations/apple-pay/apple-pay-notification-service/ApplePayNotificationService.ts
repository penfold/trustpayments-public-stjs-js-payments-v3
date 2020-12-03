import { MessageBus } from '../../../../application/core/shared/message-bus/MessageBus';
import { PAYMENT_SUCCESS } from '../../../../application/core/models/constants/Translations';
import { NotificationService } from '../../../notification/NotificationService';

export class ApplePayNotificationService {
  constructor(private messageBus: MessageBus, private notificationService: NotificationService) {}

  notification(errorcode: string, errormessage: string): void {
    switch (errorcode) {
      case '0':
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        this.notificationService.success(PAYMENT_SUCCESS);
        break;
      default:
        this.notificationService.error(errormessage);
    }
  }
}
