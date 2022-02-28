import { mock, instance, when, instance as mockInstance } from 'ts-mockito';
import { of } from 'rxjs';
import Container from 'typedi';
import { FormState } from '../../core/models/constants/FormState';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { IConfig } from '../../../shared/model/config/IConfig';
import { LABEL_EXPIRATION_DATE } from '../../core/models/constants/Translations';
import {
  EXPIRATION_DATE_INPUT,
  EXPIRATION_DATE_LABEL,
  EXPIRATION_DATE_MESSAGE,
} from '../../core/models/constants/Selectors';
import { EventScope } from '../../core/models/constants/EventScope';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { TestConfigProvider } from '../../../testing/mocks/TestConfigProvider';
import { MessageBusToken, TranslatorToken } from '../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../core/shared/translator/Translator';
import { ITranslationProvider } from '../../core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../core/shared/translator/TranslationProvider';
import { SimpleMessageBus } from '../../core/shared/message-bus/SimpleMessageBus';
import { ValidationFactory } from '../../core/shared/validation/ValidationFactory';
import { Validation } from '../../core/shared/validation/Validation';
import { ExpirationDate } from './ExpirationDate';

jest.mock('./../../core/shared/notification/Notification');

const testMessageBus = new SimpleMessageBus();
Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });
Container.set({ id: MessageBusToken, value: testMessageBus });

describe('ExpirationDate', () => {
  describe('autocomplete capture', () => {
    expirationDateFixture();
    let expirationDateInput: HTMLInputElement;

    beforeAll(() => {
      jest.spyOn(testMessageBus, 'publish');
      expirationDateInput = document.querySelector('#st-expiration-date-input');
    });

    afterAll(() => {
      expirationDateInput.value = null;
    });

    it('should capture autocomplete and emit card number from autocomplete via message bus event', () => {
      const autocompleteCaptureCardNumberInput: HTMLInputElement = document.querySelector('#st-expiration-date-input-autocomplete-capture-number');
      mockAutocompleteEvent(autocompleteCaptureCardNumberInput, '4100000000001000');
      expect(testMessageBus.publish).toHaveBeenCalledWith({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_CARD_NUMBER,
          data: '4100000000001000',
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should capture autocomplete and emit security code from autocomplete via message bus event', () => {
      const autocompleteCaptureSecurityCode: HTMLInputElement = document.querySelector('#st-expiration-date-input-autocomplete-capture-security-code');
      mockAutocompleteEvent(autocompleteCaptureSecurityCode, '123');
      expect(testMessageBus.publish).toHaveBeenCalledWith({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_SECURITY_CODE,
          data: '123',
        },
        EventScope.ALL_FRAMES
      );
    });

    it.each([['12/2034', '12/34'], ['12/24', '12/24']])('if input has no value and event from other frame with expiration date from autocomplete is received, it should set input value to received value formatted to MM/YY format',
      (autocompleteValue: string, expectedValue: string) => {
        expirationDateInput.value = null;
        testMessageBus.publish({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE,
          data: autocompleteValue,
        });
        expect(expirationDateInput.value).toEqual(expectedValue);

        expirationDateInput.value = '12/12';
        testMessageBus.publish({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE,
          data: autocompleteValue,
        });
        expect(expirationDateInput.value).toEqual('12/12');
      });
  });

  describe('ExpirationDate.ifFieldExists()', () => {
    it('should return input iframe-factory', () => {
      expect(ExpirationDate.ifFieldExists()).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('getLabel()', () => {
    const { expirationDateInstance } = expirationDateFixture();

    it('should return translated label', () => {
      expect(expirationDateInstance.getLabel()).toEqual(LABEL_EXPIRATION_DATE);
    });
  });

  describe('setDisableListener()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const attributeName = 'disabled';

    it('should have attribute disabled set', () => {
      // @ts-ignore
      expirationDateInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.BLOCKED);
      });
      expirationDateInstance.setDisableListener();
      // @ts-ignore
      expect(expirationDateInstance.inputElement.hasAttribute(attributeName)).toBe(true);
    });

    it('should have no attribute disabled and class disabled', () => {
      // @ts-ignore
      expirationDateInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.AVAILABLE);
      });
      expirationDateInstance.setDisableListener();
      // @ts-ignore
      expect(expirationDateInstance.inputElement.hasAttribute(attributeName)).toBe(false);
      // @ts-ignore
      expect(expirationDateInstance.inputElement.classList.contains(ExpirationDate.DISABLE_FIELD_CLASS)).toBe(false);
    });
  });

  describe('format()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;
    const testValue = '232';

    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(expirationDateInstance, 'setValue');
      // @ts-ignore
      expirationDateInstance.format(testValue);
    });

    it('should trigger setValue method', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onBlur()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(expirationDateInstance, 'sendState');
      // @ts-ignore
      expirationDateInstance.onBlur();
    });

    it('should call sendState()', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onFocus()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const event: Event = new Event('focus');

    beforeEach(() => {
      // @ts-ignore
      expirationDateInstance.inputElement.focus = jest.fn();
      // @ts-ignore
      expirationDateInstance.onFocus(event);
    });

    it('should call focus method from parent', () => {
      // @ts-ignore
      expect(expirationDateInstance.inputElement.focus).toBeCalled();
    });
  });

  describe('onInput()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const event: Event = new Event('input');
    const autocompleteCaptureSecurityCode: HTMLInputElement = document.querySelector('#st-expiration-date-input-autocomplete-capture-security-code');
    const autocompleteCaptureCardNumberInput: HTMLInputElement = document.querySelector('#st-expiration-date-input-autocomplete-capture-number');
    let spy: jest.SpyInstance;

    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(expirationDateInstance, 'sendState');
      autocompleteCaptureCardNumberInput.value = 'something';
      autocompleteCaptureSecurityCode.value = 'something;';

    });

    it('should call sendState method', () => {
      // @ts-ignore
      expirationDateInstance.onInput(event);
      // @ts-ignore
      expect(spy).toBeCalled();
    });

    it('should clear autocomplete capture inputs', () => {
      // @ts-ignore
      expirationDateInstance.onInput(event);
      expect(autocompleteCaptureCardNumberInput.value).toEqual('');
      expect(autocompleteCaptureSecurityCode.value).toEqual('');
    });
  });

  describe('onKeyPress()', () => {
    const { expirationDateInstance } = expirationDateFixture();

    beforeEach(() => {
      // @ts-ignore
      const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 1 });
      event.preventDefault = jest.fn();
      // @ts-ignore
      expirationDateInstance.inputElement.focus = jest.fn();
      // @ts-ignore
      expirationDateInstance.onKeyPress(event);
    });

    it('should call focus() method', () => {
      // @ts-ignore
      expect(expirationDateInstance.inputElement.focus).toHaveBeenCalled();
    });
  });

  describe('onKeydown()', () => {
    const { expirationDateInstance } = expirationDateFixture();

    beforeEach(() => {
      // @ts-ignore
      const event: KeyboardEvent = new KeyboardEvent('keydown', { keyCode: 34 });
      event.preventDefault = jest.fn();
      // @ts-ignore
      expirationDateInstance.onKeydown(event);
    });

    it('should set currentKeyCode', () => {
      // @ts-ignore
      expect(expirationDateInstance.currentKeyCode).toEqual(34);
    });
  });

  describe('sendState()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    beforeEach(() => {
      // @ts-ignore;
      spy = jest.spyOn(expirationDateInstance.messageBus, 'publish');
      // @ts-ignore;
      expirationDateInstance.sendState();
    });

    it('should call publish()', () => {
      expect(spy).toHaveBeenCalled();
    });
  });
});

function expirationDateFixture() {
  const html =
    '<form id="st-expiration-date" class="expiration-date" novalidate=""> <label id="st-expiration-date-label" for="st-expiration-date-input" class="expiration-date__label expiration-date__label--required">Expiration date</label> <input id="st-expiration-date-input" class="expiration-date__input st-error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^(0[1-9]|1[0-2])\\/([0-9]{2})$"> <div id="st-expiration-date-message" class="expiration-date__message">Field is required</div> </form><div class="expiration-date__autocomplete"><input id="st-expiration-date-input-autocomplete-capture-number" type="text" autocomplete="cc-number" tabindex="-1" inputmode="none"  tabindex="-1" inputmode="none" /> <input id="st-expiration-date-input-autocomplete-capture-security-code" type="text" autocomplete="cc-csc" tabindex="-1" inputmode="none" /></div>';
  document.body.innerHTML = html;
  const correctValue = '55';
  const incorrectValue = 'a';
  const correctDataValue = '12/19';
  const config: IConfig = {
    jwt: 'test',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' },
  };
  const configProvider: ConfigProvider = mock<ConfigProvider>();
  const formatter: Formatter = mock(Formatter);
  const mockValidation: Validation = mock(Validation);
  const validationFactory: ValidationFactory = mock(ValidationFactory);
  // @ts-ignore
  when(configProvider.getConfig()).thenReturn({
    jwt: '',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' },
  });
  when(configProvider.getConfig$()).thenReturn(of(config));
  when(validationFactory.create()).thenReturn(mockInstance(mockValidation))

  const expirationDateInstance: ExpirationDate = new ExpirationDate(
    instance(configProvider),
    instance(formatter),
    instance(validationFactory)
  );

  const labelElement = document.createElement('label');
  const inputElement = document.createElement('input');
  const messageElement = document.createElement('p');

  const element = document.createElement('input');
  const elementWithError = document.createElement('input');
  const elementWithExceededValue = document.createElement('input');

  labelElement.setAttribute('id', EXPIRATION_DATE_LABEL);
  inputElement.setAttribute('id', EXPIRATION_DATE_INPUT);
  messageElement.setAttribute('id', EXPIRATION_DATE_MESSAGE);

  element.setAttribute('value', correctValue);
  elementWithError.setAttribute('value', incorrectValue);
  elementWithExceededValue.setAttribute('value', correctDataValue);

  document.body.appendChild(labelElement);
  document.body.appendChild(inputElement);
  document.body.appendChild(messageElement);

  return { element, elementWithError, elementWithExceededValue, expirationDateInstance, configProvider };
}

function mockAutocompleteEvent(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}
