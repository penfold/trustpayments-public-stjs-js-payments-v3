import { ExpirationDate } from './ExpirationDate';
import { FormState } from '../../core/models/constants/FormState';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { mock, instance, when } from 'ts-mockito';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Frame } from '../../core/shared/frame/Frame';
import { of } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { LABEL_EXPIRATION_DATE } from '../../core/models/constants/Translations';
import {
  EXPIRATION_DATE_INPUT,
  EXPIRATION_DATE_LABEL,
  EXPIRATION_DATE_MESSAGE
} from '../../core/models/constants/Selectors';
import { SimpleMessageBus } from '../../core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import Container from 'typedi';
import { TranslatorToken } from '../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../core/shared/translator/Translator';
import { ITranslationProvider } from '../../core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../core/shared/translator/TranslationProvider';
import { TestConfigProvider } from '../../../testing/mocks/TestConfigProvider';

jest.mock('./../../core/shared/notification/Notification');

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('ExpirationDate', () => {
  describe('ExpirationDate.ifFieldExists()', () => {
    it('should return input iframe-factory', () => {
      expect(ExpirationDate.ifFieldExists()).toBeTruthy();
    });

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

  describe('_setDisableListener()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const attributeName: string = 'disabled';

    it('should have attribute disabled set', () => {
      // @ts-ignore
      expirationDateInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.BLOCKED);
      });
      expirationDateInstance.setDisableListener();
      // @ts-ignore
      expect(expirationDateInstance._inputElement.hasAttribute(attributeName)).toBe(true);
    });

    it('should have no attribute disabled and class disabled', () => {
      // @ts-ignore
      expirationDateInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.AVAILABLE);
      });
      expirationDateInstance.setDisableListener();
      // @ts-ignore
      expect(expirationDateInstance._inputElement.hasAttribute(attributeName)).toBe(false);
      // @ts-ignore
      expect(expirationDateInstance._inputElement.classList.contains(ExpirationDate.DISABLE_FIELD_CLASS)).toBe(false);
    });
  });

  describe('format()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;
    const testValue: string = '232';

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
      spy = jest.spyOn(expirationDateInstance, '_sendState');
      // @ts-ignore
      expirationDateInstance.onBlur();
    });

    it('should call _sendState()', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onFocus()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const event: Event = new Event('focus');

    beforeEach(() => {
      // @ts-ignore
      expirationDateInstance._inputElement.focus = jest.fn();
      // @ts-ignore
      expirationDateInstance.onFocus(event);
    });

    it('should call focus method from parent', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputElement.focus).toBeCalled();
    });
  });

  describe('onInput()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const event: Event = new Event('input');
    let spy: jest.SpyInstance;

    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(expirationDateInstance, '_sendState');
    });

    it('should call _sendState method', () => {
      // @ts-ignore
      expirationDateInstance.onInput(event);
      // @ts-ignore
      expect(spy).toBeCalled();
    });
  });

  describe('onKeyPress()', () => {
    const { expirationDateInstance } = expirationDateFixture();

    beforeEach(() => {
      // @ts-ignore
      const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 1 });
      event.preventDefault = jest.fn();
      // @ts-ignore
      expirationDateInstance._inputElement.focus = jest.fn();
      // @ts-ignore
      expirationDateInstance.onKeyPress(event);
    });

    it('should call focus() method', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputElement.focus).toHaveBeenCalled();
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

    it('should set _currentKeyCode', () => {
      // @ts-ignore
      expect(expirationDateInstance._currentKeyCode).toEqual(34);
    });

    it('should set _inputSelectionStart', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputSelectionStart).toEqual(0);
    });

    it('should set _inputSelectionEnd', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputSelectionEnd).toEqual(0);
    });
  });

  describe('_sendState()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    beforeEach(() => {
      // @ts-ignore;
      spy = jest.spyOn(expirationDateInstance.messageBus, 'publish');
      // @ts-ignore;
      expirationDateInstance._sendState();
    });

    it('should call publish()', () => {
      expect(spy).toHaveBeenCalled();
    });
  });
});

function expirationDateFixture() {
  const html =
    '<form id="st-expiration-date" class="expiration-date" novalidate=""> <label id="st-expiration-date-label" for="st-expiration-date-input" class="expiration-date__label expiration-date__label--required">Expiration date</label> <input id="st-expiration-date-input" class="expiration-date__input st-error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^(0[1-9]|1[0-2])\\/([0-9]{2})$"> <div id="st-expiration-date-message" class="expiration-date__message">Field is required</div> </form>';
  document.body.innerHTML = html;
  const correctValue = '55';
  const incorrectValue = 'a';
  const correctDataValue = '12/19';
  const config: IConfig = {
    jwt: 'test',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' }
  };
  let configProvider: ConfigProvider;
  configProvider = mock<ConfigProvider>();
  let formatter: Formatter;
  let frame: Frame;
  frame = mock(Frame);
  const messageBus: IMessageBus = new SimpleMessageBus();
  formatter = mock(Formatter);
  // @ts-ignore
  when(configProvider.getConfig()).thenReturn({
    jwt: '',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' }
  });
  when(configProvider.getConfig$()).thenReturn(of(config));
  const expirationDateInstance: ExpirationDate = new ExpirationDate(
    instance(configProvider),
    instance(formatter),
    messageBus,
    instance(frame)
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
