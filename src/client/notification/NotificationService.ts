import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { NotificationType } from '../../application/core/models/constants/NotificationType';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';

@Service()
export class NotificationService {
  constructor(private _messageBus: IMessageBus, private _configProvider: ConfigProvider) {}

  private get disableNotification(): boolean {
    return this._configProvider.getConfig() ? this._configProvider.getConfig().disableNotification : false;
  }

  private get submitOnError(): boolean {
    return this._configProvider.getConfig() ? this._configProvider.getConfig().submitOnError : false;
  }

  private get submitOnSuccess(): boolean {
    return this._configProvider.getConfig() ? this._configProvider.getConfig().submitOnSuccess : false;
  }

  private get submitOnCancel(): boolean {
    return this._configProvider.getConfig() ? this._configProvider.getConfig().submitOnCancel : false;
  }

  error(message: string): void {
    if (!this.disableNotification && !this.submitOnError) {
      this._setNotification(NotificationType.Error, message);
    }
  }

  info(message: string): void {
    this._setNotification(NotificationType.Info, message);
  }

  success(message: string): void {
    if (!this.disableNotification && !this.submitOnSuccess) {
      this._setNotification(NotificationType.Success, message);
    }
  }

  cancel(message: string): void {
    if (!this.disableNotification && !this.submitOnCancel) {
      this._setNotification(NotificationType.Cancel, message);
    }
  }

  private _setNotification(type: string, content: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data: { content, type },
      type: PUBLIC_EVENTS.NOTIFICATION,
    };
    this._messageBus.publish(messageBusEvent, true);
  }
}
