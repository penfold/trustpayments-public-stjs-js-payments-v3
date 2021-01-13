import { Service } from 'typedi';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { NotificationService } from '../../../../../client/notification/NotificationService';

@Service()
export class ApplePayNotificationService {
  constructor(private messageBus: IMessageBus, private notificationService: NotificationService) {}

  notification(errorcode: ApplePayClientErrorCode, errormessage: string): void {
    switch (errorcode) {
      case ApplePayClientErrorCode.SUCCESS:
        this.notificationService.success(errormessage);
        break;
      case ApplePayClientErrorCode.ERROR:
        this.notificationService.error(errormessage);
        break;
      case ApplePayClientErrorCode.DECLINE:
        this.notificationService.error(errormessage);
        break;
      case ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR:
        this.notificationService.error(errormessage);
        break;
      case ApplePayClientErrorCode.CANCEL:
        this.notificationService.cancel(errormessage);
        break;
      case ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET:
        this.notificationService.error(errormessage);
        break;
      default:
        this.notificationService.error(errormessage);
    }
  }
}
