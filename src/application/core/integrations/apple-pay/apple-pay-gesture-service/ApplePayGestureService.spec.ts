import { ApplePayGestureService } from './ApplePayGestureService';
import { APPLE_PAY_BUTTON_ID } from '../apple-pay-button-service/ApplePayButtonProperties';

describe('ApplePayGestureService', () => {
  let applePayGestureService: ApplePayGestureService;
  let someCallback = jest.fn();
  let event = new Event('click');

  beforeEach(() => {
    applePayGestureService = new ApplePayGestureService();
    document.body.innerHTML = '<form><fieldset><div id="st-apple-pay" class="st-form__group"></div></fieldset></form>';
    applePayGestureService.gestureHandle(someCallback);
    document.getElementById(APPLE_PAY_BUTTON_ID).dispatchEvent(event);
  });

  it('should call callback from parameter', () => {
    expect(someCallback).toBeCalledTimes(1);
  });

  it('should throw an error when there is no ApplePay button', () => {
    document.getElementById('st-apple-pay').id = 'st-apple-pay-2';
    expect(() => applePayGestureService.gestureHandle(someCallback)).toThrowError(
      'There is no Apple Pay container in form'
    );
  });
});
