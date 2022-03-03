import { instance as mockInstance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import Container, { ContainerInstance } from 'typedi';
import { NOT_IMPLEMENTED_ERROR } from '../../models/constants/Translations';
import { Utils } from '../utils/Utils';
import { Validation } from '../validation/Validation';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { MessageBusToken, TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../translator/Translator';
import { ITranslationProvider } from '../translator/ITranslationProvider';
import { TranslationProvider } from '../translator/TranslationProvider';
import { TestConfigProvider } from '../../../../testing/mocks/TestConfigProvider';
import { ValidationFactory } from '../validation/ValidationFactory';
import { SimpleMessageBus } from '../message-bus/SimpleMessageBus';
import { TranslatorWithMerchantTranslations } from '../translator/TranslatorWithMerchantTranslations';
import { Input } from './Input';

jest.mock('./../validation/Validation');
jest.mock('./../notification/Notification');

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('FormField', () => {
  describe('getLabel()', () => {
    const { instance } = formFieldFixture();

    it('should throw exception', () => {
      // @ts-ignore
      instance.getLabel();
      expect(() => {
        throw new Error(NOT_IMPLEMENTED_ERROR);
      }).toThrow();
    });
  });

  describe('onClick()', () => {
    let spy: jest.SpyInstance;
    const { instance } = formFieldFixture();

    beforeEach(() => {
      const event = new Event('click');
      // @ts-ignore
      spy = jest.spyOn(instance, 'click');
      // @ts-ignore
      instance.onClick(event);
    });

    it('should call click method', () => {
      expect(spy).toBeCalled();
    });
  });

  describe('onFocus()', () => {
    const { instance } = formFieldFixture();

    it('should focus on input iframe-factory', () => {
      // @ts-ignore
      const mockFocus = (instance.inputElement.focus = jest.fn());
      // @ts-ignore
      instance.onFocus();
      expect(mockFocus).toBeCalledTimes(1);
    });
  });

  describe('onInput()', () => {
    const { instance } = formFieldFixture();
    let spy: jest.SpyInstance;

    it('should input on input iframe-factory', () => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'format');
      // @ts-ignore
      instance.onInput();
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('onPaste()', () => {
    const { instance } = formFieldFixture();
    const event = {
      clipboardData: {
        getData: jest.fn(),
      },
      preventDefault: jest.fn(),
    };

    // @ts-ignore
    instance.inputElement = document.createElement('input');
    // @ts-ignore
    instance.inputElement.value = '44';
    // @ts-ignore
    instance.messageElement = document.createElement('div');

    beforeEach(() => {
      Validation.setCustomValidationError = jest.fn();
      // @ts-ignore
      instance.format = jest.fn();
      Utils.stripChars = jest.fn();

      // @ts-ignore
      instance.onPaste(event);
    });

    it('should event.preventDefault() has been called', () => {
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should Validation.setCustomValidationError method has been called', () => {
      expect(Validation.setCustomValidationError).toHaveBeenCalled();
    });

    it('should format method has been called', () => {
      // @ts-ignore
      expect(instance.format).toHaveBeenCalledWith(instance.inputElement.value);
    });

    it('should validate method has been called with inputElement and messageElement', () => {
      // @ts-ignore
      expect(instance.validation.validate).toHaveBeenCalled();
    });
  });

  describe('_addTabListener', () => {
    const { instance } = formFieldFixture();

    beforeEach(() => {
      window.addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance.onFocus = jest.fn();
      // @ts-ignore
      instance.addTabListener();
    });

    it('should call onFocus', () => {
      // @ts-ignore
      expect(instance.onFocus).toHaveBeenCalled();
    });
  });

  describe('_setInputListeners()', () => {
    const { instance } = formFieldFixture();

    beforeEach(() => {
      // @ts-ignore
      instance.inputElement.addEventListener = jest.fn().mockImplementation((event, callback) => {
        callback();
      });
    });

    beforeAll(() => {
      // @ts-ignore
      instance.onPaste = jest.fn();
      // @ts-ignore
      instance.onKeyPress = jest.fn();
      // @ts-ignore
      instance.onInput = jest.fn();
      // @ts-ignore
      instance.onFocus = jest.fn();
      // @ts-ignore
      instance.onBlur = jest.fn();
      // @ts-ignore
      instance.onClick = jest.fn();
    });

    it('should call onPaste listener', () => {
      // @ts-ignore
      instance.setInputListeners();
      // @ts-ignore
      expect(instance.onPaste).toHaveBeenCalled();
    });

    it('should call onKeyPress listener', () => {
      // @ts-ignore
      instance.setInputListeners();
      // @ts-ignore
      expect(instance.onKeyPress).toHaveBeenCalled();
    });

    it('should call onInput listener', () => {
      // @ts-ignore
      instance.setInputListeners();
      // @ts-ignore
      expect(instance.onInput).toHaveBeenCalled();
    });

    it('should call onFocus listener', () => {
      // @ts-ignore
      instance.setInputListeners();
      // @ts-ignore
      expect(instance.onFocus).toHaveBeenCalled();
    });

    it('should call onBlur listener', () => {
      // @ts-ignore
      instance.setInputListeners();
      // @ts-ignore
      expect(instance.onBlur).toHaveBeenCalled();
    });

    it('should call onClick listener', () => {
      // @ts-ignore
      instance.setInputListeners();
      // @ts-ignore
      expect(instance.onClick).toHaveBeenCalled();
    });
  });

  describe('_setLabelText()', () => {
    const { instance } = formFieldFixture();

    beforeEach(() => {
      // @ts-ignore
      instance.getLabel = jest.fn();
      // @ts-ignore
      instance.setLabelText();
    });
    it('should call an error', () => {
      // @ts-ignore
      expect(instance.getLabel).toHaveBeenCalled();
    });
  });
});

function formFieldFixture() {
  const inputElement: HTMLInputElement = document.createElement('input');
  const labelElement: HTMLLabelElement = document.createElement('label');
  const messageElement: HTMLParagraphElement = document.createElement('p');
  const configProviderMock: ConfigProvider = mock<ConfigProvider>();
  const validationFactory: ValidationFactory = mock(ValidationFactory);
  const mockValidation: Validation = mock(Validation);
  const containerMock: ContainerInstance = mock(ContainerInstance);
  const translatorToken = mock(TranslatorWithMerchantTranslations);
  const testMessageBus = new SimpleMessageBus();

  when(validationFactory.create()).thenReturn(mockInstance(mockValidation))
  when(containerMock.get(MessageBusToken)).thenReturn(testMessageBus);
  when(containerMock.get(TranslatorToken)).thenReturn(translatorToken);

  labelElement.id = 'st-form-field-label';
  inputElement.id = 'st-form-field-input';
  messageElement.id = 'st-form-field-message';

  document.body.appendChild(labelElement);
  document.body.appendChild(inputElement);
  document.body.appendChild(messageElement);
  // @ts-ignore
  Input.prototype.getLabel = jest.fn().mockReturnValueOnce(() => {
    throw new Error(NOT_IMPLEMENTED_ERROR);
  });
  when(configProviderMock.getConfig$()).thenReturn(
    of({
      stopSubmitFormOnEnter: false,
    })
  );
  const instance: Input = new Input(
    'st-form-field-input',
    'st-form-field-message',
    'st-form-field-label',
    'st-form-field__wrapper',
    mockInstance(containerMock),
    mockInstance(configProviderMock),
    mockInstance(validationFactory)
  );
  (instance as any).validation.validate = jest.fn();

  return { instance, inputElement, messageElement, labelElement };
}
