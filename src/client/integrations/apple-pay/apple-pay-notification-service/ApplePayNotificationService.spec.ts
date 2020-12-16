import { instance as mockInstance, mock, verify } from 'ts-mockito';
import { ApplePayErrorCodes } from '../../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorCodes';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../../application/core/shared/message-bus/SimpleMessageBus';
import { NotificationService } from '../../../notification/NotificationService';
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
    it(`should call NotificationService with ${ApplePayErrorCodes.SUCCESS}`, () => {
      const expectedErrorMessage = 'Success message';

      applePayNotificationService.notification(ApplePayErrorCodes.SUCCESS, expectedErrorMessage);

      verify(notificationServiceMock.success(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayErrorCodes.ERROR}`, () => {
      const expectedErrorMessage = 'Error message';

      applePayNotificationService.notification(ApplePayErrorCodes.ERROR, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR}`, () => {
      const expectedErrorMessage = 'Validate merchant error message';

      applePayNotificationService.notification(ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayErrorCodes.CANCEL}`, () => {
      const expectedErrorMessage = 'Cancel error message';

      applePayNotificationService.notification(ApplePayErrorCodes.CANCEL, expectedErrorMessage);

      verify(notificationServiceMock.cancel(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with ${ApplePayErrorCodes.NO_ACTIVE_CARDS_IN_WALLET}`, () => {
      const expectedErrorMessage = 'No active cards error message';

      applePayNotificationService.notification(ApplePayErrorCodes.NO_ACTIVE_CARDS_IN_WALLET, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });

    it(`should call NotificationService with error on unknown status`, () => {
      const expectedErrorMessage = 'Unknown';

      applePayNotificationService.notification(7 as ApplePayErrorCodes, expectedErrorMessage);

      verify(notificationServiceMock.error(expectedErrorMessage)).once();
    });
  });
});
