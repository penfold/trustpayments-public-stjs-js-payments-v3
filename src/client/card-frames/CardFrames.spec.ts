import { anyString, anything, instance as instanceOf, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import Container from 'typedi';
import { FormState } from '../../application/core/models/constants/FormState';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import { PRIVATE_EVENTS, PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import {
  CARD_NUMBER_IFRAME, CARD_NUMBER_INPUT_SELECTOR,
  EXPIRATION_DATE_IFRAME, EXPIRATION_DATE_INPUT_SELECTOR,
  SECURITY_CODE_IFRAME, SECURITY_CODE_INPUT_SELECTOR,
} from '../../application/core/models/constants/Selectors';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';
import { TranslatorToken } from '../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../application/core/shared/translator/Translator';
import { ITranslationProvider } from '../../application/core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../application/core/shared/translator/TranslationProvider';
import { TestConfigProvider } from '../../testing/mocks/TestConfigProvider';
import { EventScope } from '../../application/core/models/constants/EventScope';
import { PayButton } from '../pay-button/PayButton';
import { PayButtonFactory } from '../pay-button/PayButtonFactory';
import { CardFrames } from './CardFrames';
import spyOn = jest.spyOn;

jest.mock('./../../application/core/shared/notification/Notification');
jest.mock('./../../application/core/shared/validation/Validation');

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('CardFrames', () => {
  let configProvider: ConfigProvider;
  let iframeFactory: IframeFactory;
  let frame: Frame;
  let instance: CardFrames;
  let messageBus: IMessageBus;
  let jwtDecoder: JwtDecoder;
  let payButton: PayButton;
  let payButtonFactory: PayButtonFactory;

  beforeEach(() => {
    document.body.innerHTML =
      '<form id="st-form" class="example-form" autocomplete="off" novalidate> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label">AMOUNT</label> <input id="example-form-amount" class="example-form__input" type="number" placeholder="" name="myBillAmount" data-st-name="billingamount" /> </div> </div> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" name="myBillName" data-st-name="billingfirstname" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" name="myBillEmail" data-st-name="billingemail" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" name="myBillTel" /> <!-- no data-st-name attribute so this field will not be submitted to ST --> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group example-form__group--submit"> <button type="submit" class="example-form__button">Back</button> <button type="submit" class="example-form__button" id="merchant-submit-button">Submit</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
    const element = document.createElement('input');
    iframeFactory = mock(IframeFactory);
    jwtDecoder = mock(JwtDecoder);
    payButton = mock(PayButton);
    payButtonFactory = mock(PayButtonFactory);
    configProvider = mock<ConfigProvider>();
    messageBus = new SimpleMessageBus();
    frame = mock(Frame);
    Container.get(TranslatorToken).init();
    DomMethods.getAllFormElements = jest.fn().mockReturnValue([element]);

    when(configProvider.getConfig$()).thenReturn(
      of({
        jwt: '',
        disableNotification: false,
        placeholders: { pan: 'Card number', expirydate: 'MM/YY', securitycode: '***' },
        components: {},
        formId: 'st-form',
        componentIds: {
          cardNumber: CARD_NUMBER_INPUT_SELECTOR,
          expirationDate: EXPIRATION_DATE_INPUT_SELECTOR,
          securityCode: SECURITY_CODE_INPUT_SELECTOR,
        },
        styles: {},
        origin: '',
      })
    );

    when(iframeFactory.create(anyString(), anyString(), anything(), anything())).thenCall(
      (name: string, id: string) => {
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframe.setAttribute('name', name);
        iframe.setAttribute('id', id);
        return iframe;
      }
    );
    when(payButtonFactory.create()).thenReturn(payButton);
    when(frame.parseUrl()).thenReturn({ params: { locale: 'en_GB' } });
    when(jwtDecoder.decode(anything())).thenReturn({
      payload: {
        baseamount: '1000',
        accounttypedescription: 'ECOM',
        currencyiso3a: 'GBP',
        sitereference: 'test_jsautocardinal91923',
        locale: 'en_GB',
        pan: '3089500000000000021',
        expirydate: '01/22',
      },
    });

    instance = new CardFrames(
      instanceOf(configProvider),
      instanceOf(iframeFactory),
      instanceOf(frame),
      messageBus,
      instanceOf(jwtDecoder),
      instanceOf(payButtonFactory)
    );
    // @ts-ignore
    when(payButton.button).thenReturn(element);
    instance.init();
  });

  describe( 'disableFormField', () => {
    const data = true;
    const type = MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER;
    const messageBusEvent = {
      data,
      type,
    };

    beforeEach(() => {
      // @ts-ignore
      instance.broadcastSecurityCodeProperties = jest.fn();
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
      // @ts-ignore
      instance.disableFormField(data, type, CARD_NUMBER_IFRAME);
    });

    it('should call publish method', () => {
      // @ts-ignore
      expect(instance.messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });

  describe( 'onInput', () => {
    const messageBusEvent = {
      data: {
        billingamount: '',
        billingemail: '',
        billingfirstname: '',
      },
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS,
    };

    beforeEach(() => {
      DomMethods.parseForm = jest.fn().mockReturnValueOnce({
        billingamount: '',
        billingemail: '',
        billingfirstname: '',
      });
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
    });

    it('should call publish method', () => {
      // @ts-ignore
      instance.onInput();
      // @ts-ignore
      expect(instance.messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });

  describe( 'setMerchantInputListeners', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.setMerchantInputListeners();
    });

    it('should add event listener to each input', () => {
      expect(DomMethods.getAllFormElements).toBeCalled();
    });
  });

  describe.skip( 'submitFormListener', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.publishSubmitEvent = jest.fn();
    });

    it('should call preventDefault and publishSubmitEvent method', () => {
      // @ts-ignore
      instance.submitButton.addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance.submitFormListener();
      // @ts-ignore
      expect(instance.publishSubmitEvent).toHaveBeenCalled();
    });

    it('should remove the click listener on destroy event', () => {
      // @ts-ignore
      spyOn(instance.payButton.button, 'removeEventListener');
      // @ts-ignore
      instance.submitFormListener();
      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      // @ts-ignore
      expect(instance.payButton.button.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe( 'subscribeBlockSubmit', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.disableFormField = jest.fn();
    });

    it('should set the state of form fields on BLOCK_FORM event', () => {
      const state: FormState = FormState.BLOCKED;

      messageBus.publish({ type: PUBLIC_EVENTS.BLOCK_FORM, data: state });

      // @ts-ignore
      expect(instance.disableFormField).toHaveBeenCalledWith(
        state,
        PUBLIC_EVENTS.BLOCK_CARD_NUMBER,
      );
      // @ts-ignore
      expect(instance.disableFormField).toHaveBeenCalledWith(
        state,
        PUBLIC_EVENTS.BLOCK_EXPIRATION_DATE,
      );
      // @ts-ignore
      expect(instance.disableFormField).toHaveBeenCalledWith(
        state,
        PUBLIC_EVENTS.BLOCK_SECURITY_CODE,
      );
    });

    it('should not disable submit buttons nor form fields after DESTROY event', () => {
      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_FORM });
      messageBus.publish({ type: PUBLIC_EVENTS.UNLOCK_BUTTON });
      messageBus.publish({ type: PUBLIC_EVENTS.BLOCK_FORM, data: FormState.AVAILABLE });

      // @ts-ignore
      expect(instance.disableFormField).not.toHaveBeenCalled();
    });
  });

  describe( 'publishSubmitEvent', () => {
    const submitFormEvent = {
      data: {
        // @ts-ignore
        fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
      },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM,
    };

    beforeEach(() => {
      // @ts-ignore
      instance.messageBus.subscribe = jest.fn().mockReturnValueOnce({
        cardNumber: '',
        expirationDate: '',
        securityCode: '',
      });
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
      // @ts-ignore
      instance.publishSubmitEvent();
    });

    it('should call publish method', () => {
      // @ts-ignore
      expect(instance.messageBus.publish).toHaveBeenCalledWith(submitFormEvent, EventScope.ALL_FRAMES);
    });
  });

  describe( 'validateFieldsAfterSubmit', () => {
    function validateFieldsAfterSubmitFixture(
      stateCardNumber: boolean,
      stateExpirationDate: boolean,
      stateSecurityCode: boolean
    ) {
      return {
        cardNumber: { message: 'card', state: stateCardNumber },
        expirationDate: { message: 'expiration', state: stateExpirationDate },
        securityCode: { message: 'security', state: stateSecurityCode },
      };
    }

    beforeEach(() => {
      // @ts-ignore
      instance.publishValidatedFieldState = jest.fn();
    });

    it('should call publishValidatedFieldState for cardNumber if it\'s state is false', () => {
      const validationResult = validateFieldsAfterSubmitFixture(false, true, true);

      messageBus.publish({ type: PRIVATE_EVENTS.VALIDATE_FORM, data: validationResult });

      // @ts-ignore
      expect(instance.publishValidatedFieldState.mock.calls[0][0]).toEqual({ message: 'card', state: false });
      // @ts-ignore
      expect(instance.publishValidatedFieldState.mock.calls[0][1]).toEqual(
        MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD
      );
    });

    it('should call publishValidatedFieldState for expirationDate if it\'s state is false', () => {
      const validationResult = validateFieldsAfterSubmitFixture(true, false, true);

      messageBus.publish({ type: PRIVATE_EVENTS.VALIDATE_FORM, data: validationResult });

      // @ts-ignore
      expect(instance.publishValidatedFieldState.mock.calls[0][0]).toEqual({ message: 'expiration', state: false });
      // @ts-ignore
      expect(instance.publishValidatedFieldState.mock.calls[0][1]).toEqual(
        MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
      );
    });

    it('should call publishValidatedFieldState for securityCode if it\'s state is false', () => {
      const validationResult = validateFieldsAfterSubmitFixture(true, true, false);

      messageBus.publish({ type: PRIVATE_EVENTS.VALIDATE_FORM, data: validationResult });

      // @ts-ignore
      expect(instance.publishValidatedFieldState.mock.calls[0][0]).toEqual({ message: 'security', state: false });
      // @ts-ignore
      expect(instance.publishValidatedFieldState.mock.calls[0][1]).toEqual(
        MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD
      );
    });

    it('should not call publishValidatedFieldState after DESTROY event', () => {
      const validationResult = validateFieldsAfterSubmitFixture(true, true, true);
      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      messageBus.publish({ type: PRIVATE_EVENTS.VALIDATE_FORM, data: validationResult });

      // @ts-ignore
      expect(instance.publishValidatedFieldState).not.toHaveBeenCalled();
    });
  });

  describe( 'publishValidatedFieldState', () => {
    const field = { message: 'fuuuuuu', state: true };
    const eventType = MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD;

    beforeEach(() => {
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
      // @ts-ignore
      instance.publishValidatedFieldState(field, eventType);
    });

    it('should set messageBusEvent properties', () => {
      // @ts-ignore
      expect(instance.messageBusEvent.type).toEqual(MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD);
      // @ts-ignore
      expect(instance.messageBusEvent.data.message).toEqual(field.message);
    });

    it('should call messageBus publish method', () => {
      // @ts-ignore
      expect(instance.messageBus.publish).toHaveBeenCalledWith({
        type: MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD,
        data: { message: field.message },
      });
    });
  });

  describe('init()', () => {
    it('should create iframes for card fields and append them to DOM', () => {
      expect(document.getElementById(CARD_NUMBER_IFRAME)).toBeInstanceOf(HTMLIFrameElement);
      expect(document.getElementById(EXPIRATION_DATE_IFRAME)).toBeInstanceOf(HTMLIFrameElement);
      expect(document.getElementById(SECURITY_CODE_IFRAME)).toBeInstanceOf(HTMLIFrameElement);
    });

    it('should remove card fields iframes from the DOM on destroy event', () => {
      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      expect(document.getElementById(CARD_NUMBER_IFRAME)).toBeNull();
      expect(document.getElementById(EXPIRATION_DATE_IFRAME)).toBeNull();
      expect(document.getElementById(SECURITY_CODE_IFRAME)).toBeNull();
    });
  });
});
