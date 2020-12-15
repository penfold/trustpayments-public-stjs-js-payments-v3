import { Service } from 'typedi';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { ApplePayErrorCodes } from '../../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorCodes';
import { NotificationService } from '../../../notification/NotificationService';

@Service()
export class ApplePayNotificationService {
  constructor(private messageBus: IMessageBus, private notificationService: NotificationService) {}

  notification(errorcode: ApplePayErrorCodes, errormessage: string): void {
    switch (errorcode) {
      case ApplePayErrorCodes.SUCCESS:
        this.notificationService.success(errormessage);
        break;
      case ApplePayErrorCodes.ERROR:
        this.notificationService.error(errormessage);
        break;
      case ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR:
        this.notificationService.error(errormessage);
        break;
      case ApplePayErrorCodes.CANCEL:
        this.notificationService.cancel(errormessage);
        break;
      case ApplePayErrorCodes.NO_ACTIVE_CARDS_IN_WALLET:
        this.notificationService.error(errormessage);
        break;
      default:
        this.notificationService.error(errormessage);
    }
  }
}
