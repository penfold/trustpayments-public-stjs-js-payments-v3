import { MessageBus } from '../../../../application/core/shared/message-bus/MessageBus';
import { PAYMENT_SUCCESS } from '../../../../application/core/models/constants/Translations';
import { NotificationService } from '../../../notification/NotificationService';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { ApplePayErrorCodes } from '../../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorCodes';

export class ApplePayNotificationService {
  constructor(private messageBus: IMessageBus, private notificationService: NotificationService) {}

  notification(errorcode: ApplePayErrorCodes, errormessage: string): void {
    switch (errorcode) {
      case ApplePayErrorCodes.SUCCESS:
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        this.notificationService.success(PAYMENT_SUCCESS);
        break;
      default:
        this.notificationService.error(errormessage);
    }
  }
}
