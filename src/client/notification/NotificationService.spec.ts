import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { NotificationType } from '../../application/core/models/constants/NotificationType';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../shared/model/config/IConfig';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { EventScope } from '../../application/core/models/constants/EventScope';
import { NotificationService } from './NotificationService';

describe('NotificationService', () => {
  let messageBus: IMessageBus;
  let configProvider: ConfigProvider;
  let notificationService: NotificationService;

  beforeEach(() => {
    messageBus = mock<IMessageBus>();
    configProvider = mock<ConfigProvider>();
    notificationService = new NotificationService(instance(messageBus), instance(configProvider));
  });

  describe('error function has been called', () => {
    beforeEach(() => {
      // @ts-ignore
      when(configProvider.getConfig()).thenReturn(({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false,
      } as unknown) as IConfig);
    });

    it('should call _setNotification with error message and error type of notification', () => {
      notificationService.error('Test value');
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Error, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
    });
  });

  describe('success function has been called', () => {
    beforeEach(() => {
      // @ts-ignore
      when(configProvider.getConfig()).thenReturn(({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false,
      } as unknown) as IConfig);
    });

    it('should call _setNotification with success message and success type of notification', () => {
      notificationService.success('Test value');
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Success, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
    });
  });

  describe('cancel function has been called', () => {
    beforeEach(() => {
      // @ts-ignore
      when(configProvider.getConfig()).thenReturn(({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false,
      } as unknown) as IConfig);
    });

    it('should call _setNotification with cancel message and cancel type of notification', () => {
      notificationService.cancel('Test value');
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Cancel, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
    });
  });

  describe('info function has been called', () => {
    beforeEach(() => {
      // @ts-ignore
      when(configProvider.getConfig()).thenReturn(({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false,
      } as unknown) as IConfig);
    });

    it('should call _setNotification with info message and info type of notification', () => {
      notificationService.info('Test value');
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Info, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION,
          }),
          EventScope.ALL_FRAMES
        )
      ).once();
    });
  });
});
