import { anyFunction, anything, instance as mockInstance, instance, mock, when } from 'ts-mockito';
import { EMPTY, of } from 'rxjs';
import Container from 'typedi';
import { SECURITY_CODE_INPUT, SECURITY_CODE_LABEL, SECURITY_CODE_MESSAGE } from '../../core/models/constants/Selectors';
import { Input } from '../../core/shared/input/Input';
import { Utils } from '../../core/shared/utils/Utils';
import { Validation } from '../../core/shared/validation/Validation';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { MessageBusToken, TranslatorToken } from '../../../shared/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { SimpleMessageBus } from '../../core/shared/message-bus/SimpleMessageBus';
import { FormState } from '../../core/models/constants/FormState';
import { TestConfigProvider } from '../../../testing/mocks/TestConfigProvider';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { Translator } from '../../core/shared/translator/Translator';
import { EventScope } from '../../core/models/constants/EventScope';
import { ITranslationProvider } from '../../core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../core/shared/translator/TranslationProvider';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ValidationFactory } from '../../core/shared/validation/ValidationFactory';
import { SecurityCode } from './SecurityCode';

jest.mock('./../../core/shared/notification/Notification');

const testMessageBus = new SimpleMessageBus();

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });
Container.set({ id: MessageBusToken, value: testMessageBus });

describe('SecurityCode', () => {
  const { securityCodeInstance } = securityCodeFixture();

  describe('init', () => {
    it('should create instance of classes SecurityCode and input representing form field', () => {
      expect(securityCodeInstance).toBeInstanceOf(SecurityCode);
      expect(securityCodeInstance).toBeInstanceOf(Input);
    });
  });

  describe('autocomplete capture', () => {
    let securityCodeInput: HTMLInputElement;

    beforeAll(() => {
      jest.spyOn(testMessageBus, 'publish');
      securityCodeInput = document.querySelector('#st-security-code-input');
    });

    afterAll(() => {
      securityCodeInput.value = null;
    });

    it('should capture autocomplete and emit card number from autocomplete via message bus event', () => {
      const autocompleteCaptureCardNumberInput: HTMLInputElement = document.querySelector('#st-security-code-input-autocomplete-capture-number');
      mockAutocompleteEvent(autocompleteCaptureCardNumberInput, '4100000000001000');
      expect(testMessageBus.publish).toHaveBeenCalledWith({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_CARD_NUMBER,
          data: '4100000000001000',
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should capture autocomplete and emit expiration date from autocomplete via message bus event', () => {
      const autocompleteCaptureExpiratioDateInput: HTMLInputElement = document.querySelector('#st-security-code-input-autocomplete-capture-expiration-date');
      mockAutocompleteEvent(autocompleteCaptureExpiratioDateInput, '12/34');
      expect(testMessageBus.publish).toHaveBeenCalledWith({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE,
          data: '12/34',
        },
        EventScope.ALL_FRAMES
      );
    });

    it('if input has no value and event from other frame with security code from autocomplete is received, it should set input value to received value',
      () => {
        securityCodeInput.value = null;
        testMessageBus.publish({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_SECURITY_CODE,
          data: '123',
        });
        expect(securityCodeInput.value).toEqual('123');

        securityCodeInput.value = '345';
        testMessageBus.publish({
          type: PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE,
          data: '123',
        });
        expect(securityCodeInput.value).toEqual('345');
      });
  });

  describe('ifFieldExists', () => {
    let ifFieldExists: HTMLInputElement;

    beforeEach(() => {
      ifFieldExists = SecurityCode.ifFieldExists();
    });

    it('should security code field exist', () => {
      expect(ifFieldExists).toBeTruthy();
    });

    it('should security code field be an instance of HTMLDivElement', () => {
      expect(SecurityCode.ifFieldExists()).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('getLabel', () => {
    it('should have a label', () => {
      expect(securityCodeInstance.getLabel()).toBe('Security code');
    });
  });

  describe('setDisableListener', () => {
    const { securityCodeInstance } = securityCodeFixture();

    it('should set attribute disabled and add class to classList', () => {
      // @ts-ignore
      securityCodeInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.BLOCKED);
      });
      // @ts-ignore
      securityCodeInstance.setDisableListener();
      // @ts-ignore
      expect(securityCodeInstance.inputElement.hasAttribute('disabled')).toEqual(true);
      // @ts-ignore
      expect(securityCodeInstance.inputElement.classList.contains(SecurityCode.DISABLED_CLASS)).toEqual(true);
    });

    it('should remove attribute disabled and remove class from classList', () => {
      // @ts-ignore
      securityCodeInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.AVAILABLE);
      });
      // @ts-ignore
      securityCodeInstance.setDisableListener();
      // @ts-ignore
      expect(securityCodeInstance.inputElement.hasAttribute('disabled')).toEqual(false);
      // @ts-ignore
      expect(securityCodeInstance.inputElement.classList.contains(SecurityCode.DISABLED_CLASS)).toEqual(
        false
      );
    });
  });

  describe('onBlur', () => {
    const { securityCodeInstance } = securityCodeFixture();
    // @ts-ignore
    const spySendState = jest.spyOn(securityCodeInstance, 'sendState');

    beforeEach(() => {
      // @ts-ignore
      securityCodeInstance.onBlur();
    });

    it('should sendState method has been called', () => {
      expect(spySendState).toHaveBeenCalled();
    });
  });

  describe('onFocus()', () => {
    const { securityCodeInstance } = securityCodeFixture();
    const event: Event = new Event('focus');
    // @ts-ignore
    securityCodeInstance.inputElement.focus = jest.fn();

    it('should call super function', () => {
      // @ts-ignore
      securityCodeInstance.onFocus(event);
      // @ts-ignore
      expect(securityCodeInstance.inputElement.focus).toHaveBeenCalled();
    });
  });

  describe('onInput', () => {
    const { securityCodeInstance } = securityCodeFixture();
    const autocompleteCaptureExpirationDateInput: HTMLInputElement = document.querySelector('#st-security-code-input-autocomplete-capture-expiration-date');
    const autocompleteCaptureCardNumberInput: HTMLInputElement = document.querySelector('#st-security-code-input-autocomplete-capture-number');
    // @ts-ignore
    securityCodeInstance.sendState = jest.fn();
    const event = new Event('input');

    beforeEach(() => {
      autocompleteCaptureCardNumberInput.value = 'something';
      autocompleteCaptureExpirationDateInput.value = 'something';
      // @ts-ignore
      securityCodeInstance.inputElement.value = '1234';
      // @ts-ignore
      securityCodeInstance.onInput(event);
    });

    it('should call sendState', () => {
      // @ts-ignore
      expect(securityCodeInstance.sendState).toHaveBeenCalled();
    });

    it('should trim too long value', () => {
      // @ts-ignore
      expect(securityCodeInstance.inputElement.value).toEqual('');
    });

    it('should clear autocomplete capture inputs', ()=> {
      expect(autocompleteCaptureExpirationDateInput.value).toEqual('');
      expect(autocompleteCaptureCardNumberInput.value).toEqual('');
    });
  });

  describe('onPaste()', () => {
    const { securityCodeInstance } = securityCodeFixture();

    beforeEach(() => {
      const event = {
        clipboardData: {
          getData: jest.fn(),
        },
        preventDefault: jest.fn(),
      };
      Utils.stripChars = jest.fn().mockReturnValue('111');
      // @ts-ignore
      securityCodeInstance.sendState = jest.fn();
      // @ts-ignore
      securityCodeInstance.onPaste(event);
    });

    it('should call sendState method', () => {
      // @ts-ignore
      expect(securityCodeInstance.sendState).toHaveBeenCalled();
    });
  });

  describe('onKeyPress()', () => {
    const { securityCodeInstance } = securityCodeFixture();
    const event = new KeyboardEvent('keypress');

    beforeEach(() => {
      // @ts-ignore
      SecurityCode.prototype.onKeyPress = jest.fn();
      // @ts-ignore
      securityCodeInstance.onKeyPress(event);
    });

    it('should call onKeyPress', () => {
      // @ts-ignore
      expect(SecurityCode.prototype.onKeyPress).toHaveBeenCalledWith(event);
    });
  });

  describe('sendState', () => {
    const { securityCodeInstance } = securityCodeFixture();
    // @ts-ignore
    it('should publish method has been called', () => {
      // @ts-ignore
      jest.spyOn(securityCodeInstance.messageBus, 'publish');
      // @ts-ignore
      securityCodeInstance.sendState();
      // @ts-ignore
      expect(securityCodeInstance.messageBus.publish).toHaveBeenCalled();
    });
  });

  describe('_subscribeSecurityCodeChange', () => {
    const { securityCodeInstance, configProvider } = securityCodeFixture();
    when(configProvider.getConfig()).thenReturn({ placeholders: { securitycode: '***' } } as IConfig);
    it('should return standard security code pattern', () => {
      // @ts-ignore
      securityCodeInstance.messageBus.publish({ type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, data: 3 });
      // @ts-ignore
      expect(securityCodeInstance.placeholder).toEqual('***');
    });
  });

  describe('setSecurityCodePattern', () => {
    const pattern = 'some243pa%^tern';
    const { securityCodeInstance } = securityCodeFixture();

    it('should set pattern attribute on input field', () => {
      // @ts-ignore
      securityCodeInstance.setSecurityCodePattern(pattern);
      // @ts-ignore
      expect(securityCodeInstance.inputElement.getAttribute('pattern')).toEqual(pattern);
    });
  });
});

function securityCodeFixture() {
  const html =
    '<form id="st-security-code" class="security-code" novalidate=""><label id="st-security-code-label" for="st-security-code-input" class="security-code__label security-code__label--required">Security code</label><input id="st-security-code-input" class="security-code__input st-error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^[0-9]{3}$"><div id="st-security-code-message" class="security-code__message">Field is required</div><div class="security-code__autocomplete"><input id="st-security-code-input-autocomplete-capture-expiration-date" type="text" autocomplete="cc-exp" tabindex="-1" inputmode="none" /><input id="st-security-code-input-autocomplete-capture-number" type="text" autocomplete="cc-number" tabindex="-1" inputmode="none" /></div></form>';
  document.body.innerHTML = html;
  const labelElement = document.createElement('label');
  const inputElement = document.createElement('input');
  const messageElement = document.createElement('p');

  labelElement.id = SECURITY_CODE_LABEL;
  inputElement.id = SECURITY_CODE_INPUT;
  messageElement.id = SECURITY_CODE_MESSAGE;

  document.body.appendChild(labelElement);
  document.body.appendChild(inputElement);
  document.body.appendChild(messageElement);

  const config: IConfig = {
    jwt: 'test',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' },
  };

  const communicatorMock: InterFrameCommunicator = mock(InterFrameCommunicator);
  when(communicatorMock.incomingEvent$).thenReturn(EMPTY);

  const configProvider: ConfigProvider = mock<ConfigProvider>();
  const formatter: Formatter = mock(Formatter);
  const validation: Validation = mock(Validation);
  const jwtDecoder: JwtDecoder = mock(JwtDecoder);
  const validationFactory: ValidationFactory = mock(ValidationFactory);
  const localStorage: BrowserLocalStorage = mock(BrowserLocalStorage);
  when(localStorage.select(anyFunction())).thenReturn(of('34****4565'));
  when(configProvider.getConfig$()).thenReturn(of(config));
  when(configProvider.getConfig()).thenReturn(config);
  when(validation.limitLength(anything(), anything())).thenCall((input, length) => input.substring(0, length));
  when(validationFactory.create()).thenReturn(mockInstance(validation))
  when(formatter.code(anything(), anything(), anything())).thenCall((input: string) => input.length > 3 ? '' : input);

  const securityCodeInstance = new SecurityCode(
    instance(configProvider),
    instance(localStorage),
    instance(formatter),
    instance(jwtDecoder),
    instance(validationFactory)
  );

  return { securityCodeInstance, configProvider, communicatorMock, formatter };
}

function mockAutocompleteEvent(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}
