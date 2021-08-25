import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { NotificationType } from '../../application/core/models/constants/NotificationType';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';

@Service()
export class NotificationService {
  constructor(private messageBus: IMessageBus, private configProvider: ConfigProvider) {}

  private get disableNotification(): boolean {
    return this.configProvider.getConfig() ? this.configProvider.getConfig().disableNotification : false;
  }

  private get submitOnError(): boolean {
    return this.configProvider.getConfig() ? this.configProvider.getConfig().submitOnError : false;
  }

  private get submitOnSuccess(): boolean {
    return this.configProvider.getConfig() ? this.configProvider.getConfig().submitOnSuccess : false;
  }

  private get submitOnCancel(): boolean {
    return this.configProvider.getConfig() ? this.configProvider.getConfig().submitOnCancel : false;
  }

  public error(message: string): void {
    if (!this.disableNotification && !this.submitOnError) {
      this.setNotification(NotificationType.Error, message);
    }
  }

  public info(message: string): void {
    this.setNotification(NotificationType.Info, message);
  }

  public success(message: string): void {
    if (!this.disableNotification && !this.submitOnSuccess) {
      this.setNotification(NotificationType.Success, message);
    }
  }

  public cancel(message: string): void {
    if (!this.disableNotification && !this.submitOnCancel) {
      this.setNotification(NotificationType.Cancel, message);
    }
  }

  private setNotification(type: string, content: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data: { content, type },
      type: PUBLIC_EVENTS.NOTIFICATION,
    };
    this.messageBus.publish(messageBusEvent, true);
  }
}
