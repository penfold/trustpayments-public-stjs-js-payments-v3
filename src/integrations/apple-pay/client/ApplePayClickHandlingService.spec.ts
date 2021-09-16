import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { ApplePayClickHandlingService } from './ApplePayClickHandlingService';
import Mock = jest.Mock;
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';

describe('ApplePayClickHandlingService', () => {
  let messageBus: IMessageBus;
  let applePayClickHandlingService: ApplePayClickHandlingService;
  let buttonElement: HTMLElement;
  let callback: Mock;

  beforeEach(() => {
    messageBus = new SimpleMessageBus();
    applePayClickHandlingService = new ApplePayClickHandlingService(messageBus);
    document.body.innerHTML = '<form><div id="st-apple-pay" class="st-form__group"></div></form>';
    buttonElement = document.getElementById('st-apple-pay');
    callback = jest.fn();
  });

  describe('bindClickHandler()', () => {
    it('calls the callback on button click', () => {
      applePayClickHandlingService.bindClickHandler(callback, APPLE_PAY_BUTTON_ID);

      buttonElement.click();

      expect(callback).toHaveBeenCalled();
    });

    it('unsubscribes from previous subscription on new binding', () => {
      const newCallback = jest.fn();

      applePayClickHandlingService.bindClickHandler(callback, APPLE_PAY_BUTTON_ID);
      applePayClickHandlingService.bindClickHandler(newCallback, APPLE_PAY_BUTTON_ID);

      buttonElement.click();

      expect(callback).not.toHaveBeenCalled();
      expect(newCallback).toHaveBeenCalled();
    });

    it('throws an error when button element doesnt exist', () => {
      expect(
        () => applePayClickHandlingService.bindClickHandler(callback, 'non-existing-button')
      ).toThrowError('There is no Apple Pay container in form');
    });

    it('doesnt call callback after DESTROY event', () => {
      applePayClickHandlingService.bindClickHandler(callback, APPLE_PAY_BUTTON_ID);

      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });

      buttonElement.click();

      expect(callback).not.toHaveBeenCalled();
    });

    it('doesnt call the callback on second click', () => {
      applePayClickHandlingService.bindClickHandler(callback, APPLE_PAY_BUTTON_ID);

      buttonElement.click();
      buttonElement.click();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('calls the callback on second click after CALL_MERCHANT_SUBMIT_CALLBACK event', () => {
      applePayClickHandlingService.bindClickHandler(callback, APPLE_PAY_BUTTON_ID);

      buttonElement.click();

      messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK });

      buttonElement.click();

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
