import { instance as mockInstance, mock, verify } from 'ts-mockito';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../shared/message-bus/SimpleMessageBus';
import { NotificationService } from '../../../../../client/notification/NotificationService';
import { ApplePayNotificationService } from './ApplePayNotificationService';

describe('ApplePayClient', () => {
  let applePayNotificationService: ApplePayNotificationService;
  let messageBusMock: IMessageBus;
  let notificationServiceMock: NotificationService;

  beforeEach(() => {
    messageBusMock = new SimpleMessageBus();
    notificationServiceMock = mock(NotificationService);

    applePayNotificationService = new ApplePayNotificationService(
      messageBusMock,
      mockInstance(notificationServiceMock)
    );
  });

  describe('notification()', () => {
    it(`should call NotificationService with ${ApplePayClientErrorCode.SUCCESS}`, () => {
      const expectedErrorMessage = 'Success message';

      applePayNotificationService.notification(ApplePayClientErrorCode.SUCCESS, expectedErrorMessage);

      verify(notificationServiceMock.success(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayClientErrorCode.ERROR}`, () => {
      const expectedErrorMessage = 'Error message';

      applePayNotificationService.notification(ApplePayClientErrorCode.ERROR, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR}`, () => {
      const expectedErrorMessage = 'Validate merchant error message';

      applePayNotificationService.notification(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayClientErrorCode.CANCEL}`, () => {
      const expectedErrorMessage = 'Cancel error message';

      applePayNotificationService.notification(ApplePayClientErrorCode.CANCEL, expectedErrorMessage);

      verify(notificationServiceMock.cancel(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET}`, () => {
      const expectedErrorMessage = 'No active cards error message';

      applePayNotificationService.notification(ApplePayClientErrorCode.NO_ACTIVE_CARDS_IN_WALLET, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with error on unknown status`, () => {
      const expectedErrorMessage = 'Unknown';

      applePayNotificationService.notification(7 as ApplePayClientErrorCode, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });
  });
});
