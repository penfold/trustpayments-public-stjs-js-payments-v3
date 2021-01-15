import { Service } from 'typedi';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { NotificationService } from '../../../../../client/notification/NotificationService';

@Service()
export class ApplePayNotificationService {
  constructor(private messageBus: IMessageBus, private notificationService: NotificationService) {}

  notification(errorCode: ApplePayClientErrorCode, errorMessage: string): void {
    switch (errorCode) {
      case ApplePayClientErrorCode.SUCCESS:
        this.notificationService.success(errorMessage);
        break;
      case ApplePayClientErrorCode.ERROR:
        this.notificationService.error(errorMessage);
        break;
      case ApplePayClientErrorCode.DECLINE:
        this.notificationService.error(errorMessage);
        break;
      case ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR:
        this.notificationService.error(errorMessage);
        break;
      case ApplePayClientErrorCode.CANCEL:
        this.notificationService.cancel(errorMessage);
        break;
      case ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET:
        this.notificationService.error(errorMessage);
        break;
      default:
        this.notificationService.error(errorMessage);
    }
  }
}
