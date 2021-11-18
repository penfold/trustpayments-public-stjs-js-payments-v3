import { Service } from 'typedi';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { INotificationEvent } from '../../models/INotificationEvent';
import {
  NOTIFICATION_FRAME_CORE_CLASS,
  NOTIFICATION_FRAME_ID,
} from '../../models/constants/Selectors';
import { environment } from '../../../../environments/environment';
import { MessageBus } from '../message-bus/MessageBus';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { NotificationsClasses } from '../../models/constants/notifications/NotificationsClasses';
import { NotificationsMessageTypes } from '../../models/constants/notifications/NotificationsMessageTypes';
import { Frame } from '../frame/Frame';
import { IMessageBus } from '../message-bus/IMessageBus';
import { Styler } from '../styler/Styler';
import { ITranslator } from '../translator/ITranslator';

@Service()
export class Notification {
  private messageMap: Map<string, string>;
  private timeoutId: number;

  constructor(
    private messageBus: IMessageBus,
    private browserLocalStorage: BrowserLocalStorage,
    private configProvider: ConfigProvider,
    private framesHub: FramesHub,
    private frame: Frame,
    private translator: ITranslator
  ) {
    this.applyStyles();
    this.messageMap = new Map(Object.entries(NotificationsClasses));
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.NOTIFICATION, (event: INotificationEvent) => {
      this.displayNotification(event);
    });
  }

  private applyStyles(): void {
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      const definedStyles = config.styles.notificationFrame || {};
      const styles = Object.keys(definedStyles).map((item: string) => {
        return { [item]: definedStyles[item] };
      });
      new Styler(this.getAllowedStyles(), styles);
    });
  }

  private getAllowedStyles(): IAllowedStyles {
    let allowed: IAllowedStyles = {
      'background-color-body': { property: 'background-color', selector: 'body' },
      'color-body': { property: 'color', selector: 'body' },
      'font-size-body': { property: 'font-size', selector: 'body' },
      'line-height-body': { property: 'line-height', selector: 'body' },
      'space-inset-body': { property: 'padding', selector: 'body' },
      'space-outset-body': { property: 'margin', selector: 'body' },
    };
    const notification = `#${NOTIFICATION_FRAME_ID}`;
    const error = `.${NotificationsClasses.error}${notification}`;
    const success = `.${NotificationsClasses.success}${notification}`;
    const cancel = `.${NotificationsClasses.cancel}${notification}`;
    const info = `.${NotificationsClasses.info}${notification}`;
    allowed = {
      ...allowed,
      'background-color-notification': {
        property: 'background-color',
        selector: notification,
      },
      'background-color-notification-error': {
        property: 'background-color',
        selector: error,
      },
      'background-color-notification-info': {
        property: 'background-color',
        selector: info,
      },
      'background-color-notification-success': {
        property: 'background-color',
        selector: success,
      },
      'background-color-notification-cancel': {
        property: 'background-color',
        selector: cancel,
      },
      'border-color-notification': { property: 'border-color', selector: notification },
      'border-color-notification-error': { property: 'border-color', selector: error },
      'border-color-notification-info': { property: 'border-color', selector: info },
      'border-color-notification-success': {
        property: 'border-color',
        selector: success,
      },
      'border-color-notification-cancel': {
        property: 'border-color',
        selector: cancel,
      },
      'border-radius-notification': { property: 'border-radius', selector: notification },
      'border-radius-notification-error': { property: 'border-radius', selector: error },
      'border-radius-notification-info': { property: 'border-radius', selector: info },
      'border-radius-notification-success': {
        property: 'border-radius',
        selector: success,
      },
      'border-radius-notification-cancel': {
        property: 'border-radius',
        selector: cancel,
      },
      'border-size-notification': { property: 'border-width', selector: notification },
      'border-size-notification-error': { property: 'border-width', selector: error },
      'border-size-notification-info': { property: 'border-width', selector: info },
      'border-size-notification-success': { property: 'border-width', selector: success },
      'border-size-notification-cancel': { property: 'border-width', selector: cancel },
      'color-notification': { property: 'color', selector: notification },
      'color-notification-error': { property: 'color', selector: error },
      'color-notification-info': { property: 'color', selector: info },
      'color-notification-success': { property: 'color', selector: success },
      'color-notification-cancel': { property: 'color', selector: cancel },
      'font-size-notification': { property: 'font-size', selector: notification },
      'line-height-notification': { property: 'line-height', selector: notification },
      'space-inset-notification': { property: 'padding', selector: notification },
      'space-inset-notification-error': { property: 'padding', selector: error },
      'space-inset-notification-info': { property: 'padding', selector: info },
      'space-inset-notification-success': { property: 'padding', selector: success },
      'space-inset-notification-cancel': { property: 'padding', selector: cancel },
      'space-outset-notification': { property: 'margin', selector: notification },
      'space-outset-notification-error': { property: 'margin', selector: error },
      'space-outset-notification-info': { property: 'margin', selector: info },
      'space-outset-notification-success': { property: 'margin', selector: success },
      'space-outset-notification-cancel': { property: 'margin', selector: cancel },
    };
    return allowed;
  }

  private insertContent(notificationFrameElement: HTMLElement, content: string): void {
    notificationFrameElement.textContent = this.translator.translate(content);
  }

  private getMessageClass = (messageType: string): string => this.messageMap.get(messageType.toLowerCase());

  private setDataNotificationColorAttribute(notificationFrameElement: HTMLElement, messageType: string): void {
    switch (messageType) {
      case NotificationsMessageTypes.error:
        notificationFrameElement.setAttribute('data-notification-color', 'red');
        break;
      case NotificationsMessageTypes.info:
        notificationFrameElement.setAttribute('data-notification-color', 'grey');
        break;
      case NotificationsMessageTypes.success:
        notificationFrameElement.setAttribute('data-notification-color', 'green');
        break;
      case NotificationsMessageTypes.cancel:
        notificationFrameElement.setAttribute('data-notification-color', 'yellow');
        break;
      default:
        notificationFrameElement.setAttribute('data-notification-color', 'undefined');
    }
  }

  private setAttributeClass(notificationFrameElement: HTMLElement, type: string): void {
    const notificationElementClass = this.getMessageClass(type);
    notificationFrameElement.classList.add(NOTIFICATION_FRAME_CORE_CLASS);
    if (notificationElementClass) {
      notificationFrameElement.classList.remove(...Object.values(NotificationsClasses));
      notificationFrameElement.classList.add(notificationElementClass);
      this.setDataNotificationColorAttribute(notificationFrameElement, type);
      if (type === NotificationsMessageTypes.success) {
        window.clearTimeout(this.timeoutId);
        return;
      }
      this.timeoutId = window.setTimeout(() => {
        notificationFrameElement.classList.remove(notificationElementClass);
        notificationFrameElement.classList.remove(NOTIFICATION_FRAME_CORE_CLASS);
        this.insertContent(notificationFrameElement, '');
      }, environment.NOTIFICATION_TTL);
    }
  }

  private displayNotification(data: INotificationEvent): void {
    const { content, type } = data;
    const notificationFrameElement = document.getElementById(
      this.configProvider.getConfig().componentIds.notificationFrame
    );

    if (!notificationFrameElement) {
      return;
    }

    this.insertContent(notificationFrameElement, content);
    this.setAttributeClass(notificationFrameElement, type);
  }
}
