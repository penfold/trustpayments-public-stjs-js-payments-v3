import { ApplePayGestureService } from './ApplePayGestureService';
import { APPLE_PAY_BUTTON_ID } from '../apple-pay-button-service/ApplePayButtonProperties';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';

describe('ApplePayGestureService', () => {
  let applePayGestureService: ApplePayGestureService;
  let messageBus: IMessageBus;
  const someCallback = jest.fn();
  const event = new Event('click');

  beforeEach(() => {
    messageBus = new SimpleMessageBus();
    applePayGestureService = new ApplePayGestureService(messageBus);
    document.body.innerHTML = '<form><fieldset><div id="st-apple-pay" class="st-form__group"></div></fieldset></form>';
    applePayGestureService.gestureHandle(someCallback, APPLE_PAY_BUTTON_ID);
  });

  it('should call callback from parameter', () => {
    document.getElementById(APPLE_PAY_BUTTON_ID).dispatchEvent(event);

    expect(someCallback).toBeCalledTimes(1);
  });

  it('should throw an error when there is no ApplePay button', () => {
    document.getElementById('st-apple-pay').id = 'st-apple-pay-2';
    expect(() => applePayGestureService.gestureHandle(someCallback, APPLE_PAY_BUTTON_ID)).toThrowError(
      'There is no Apple Pay container in form'
    );
  });

  it('should remove the click listener on DESTROY event', () => {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);

    jest.spyOn(button, 'removeEventListener');

    messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });

    button.dispatchEvent(event);

    expect(button.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(someCallback).not.toHaveBeenCalled();
  });
});
