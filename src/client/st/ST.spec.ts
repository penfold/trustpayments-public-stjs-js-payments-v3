import 'reflect-metadata';

import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { EventScope } from '../../application/core/models/constants/EventScope';
import { config, jwt } from './STTestConfigs';
import SecureTrading, { ST } from './ST';

describe('ST', () => {
  let stInstance: ST;
  const messageBusMock =  new SimpleMessageBus();

  beforeEach(() => {
    document.body.innerHTML =
      '<form id="st-form" class="example-form">' +
      '<h1 class="example-form__title">Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span></h1>' +
      '<div class="example-form__section example-form__section--horizontal">' +
      '<div class="example-form__group"><label for="example-form-name" class="example-form__label example-form__label--required">NAME</label>' +
      '<input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" />' +
      '</div><div class="example-form__group"><label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label>' +
      '<input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /></div>' +
      '<div class="example-form__group"><label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label>' +
      '<input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /></div></div>' +
      '<div class="example-form__spacer"></div><div class="example-form__section"><div id="st-notification-frame" class="example-form__group"></div>' +
      '<div id="st-card-number" class="example-form__group"></div><div id="st-expiration-date" class="example-form__group"></div>' +
      '<div id="st-security-code" class="example-form__group"></div><div id="st-error-container" class="example-form__group"></div>' +
      '<div class="example-form__spacer"></div></div><div class="example-form__section"><div class="example-form__group">' +
      '<button type="submit" class="st-form__button st-button-submit__disabled" disabled>Pay</button></div></div><div class="example-form__section">' +
      '<div id="st-control-frame" class="example-form__group"></div><div id="st-visa-checkout" class="example-form__group"></div>' +
      '<div id="st-apple-pay" class="example-form__group"></div></div><div id="st-animated-card" class="st-animated-card-wrapper">' +
      '</div></form>';
    stInstance = SecureTrading(config);

    (stInstance as any).displayLiveStatus = jest.fn();
    (stInstance as any).messageBus = messageBusMock;
  });

  describe('Components()', () => {
    let submitButton: HTMLButtonElement;
    beforeEach(() => {

      submitButton = document.querySelector('button[type="submit"]');
      stInstance.Components(config.components);
    });

    it('should block submit button', () => {
      expect(submitButton.classList.contains('st-button-submit__disabled')).toEqual(true);
      expect(submitButton.getAttribute('disabled')).toEqual('');
    });
  });

  describe('init()', () => {
    it('should display test mode message when the library is not in the production mode', () => {
      stInstance.init({
        jwt,
        livestatus: 0,
      });

      expect((stInstance as any).displayLiveStatus).toHaveBeenCalledWith(false);
    });

    it('should not display test mode message when the library is in the production mode', () => {

      stInstance.init({
        jwt,
        livestatus: 1,
      });

      expect((stInstance as any).displayLiveStatus).toHaveBeenCalledWith(true);
    });
  });

  describe('updateJWT()', () => {
    beforeEach(() => {
      jest.spyOn(messageBusMock, 'publish');
      stInstance.updateJWT('somenewjwtvalue');
    });

    it('should send UPDATE_JWT event to message bus', () => {
      expect(messageBusMock.publish).toHaveBeenCalledWith({
        type: PUBLIC_EVENTS.UPDATE_JWT,
        data: { newJwt: 'somenewjwtvalue' },
      });
    });

    it('should throw an error if newJwt is not specified', () => {
      expect(() => {
        stInstance.updateJWT(null);
      }).toThrow();
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      jest.spyOn(messageBusMock, 'publish');
      stInstance.destroy();
    });

    it(`should send ${PUBLIC_EVENTS.DESTROY} event on MessageBus`, () => {
      expect(messageBusMock.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.DESTROY }, EventScope.ALL_FRAMES);
    });

  });

  describe('cancelThreeDProcess()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(messageBusMock, 'publish');
      stInstance.cancelThreeDProcess();
    });

    it(`should send ${PUBLIC_EVENTS.THREED_CANCEL} event on MessageBus`, () => {
      expect(messageBusMock.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.THREED_CANCEL }, EventScope.ALL_FRAMES);
    });
  });
});
