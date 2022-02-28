import Container, { ContainerInstance } from 'typedi';
import { instance as mockInstance, mock } from 'ts-mockito';
import { MessageBus } from '../message-bus/MessageBus';
import {
  VALIDATION_ERROR,
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
} from '../../models/constants/Translations';
import { FormState } from '../../models/constants/FormState';
import { StCodec } from '../../services/st-codec/StCodec';
import { IResponseData } from '../../models/IResponseData';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../translator/Translator';
import { ITranslationProvider } from '../translator/ITranslationProvider';
import { TranslationProvider } from '../translator/TranslationProvider';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../../../../testing/mocks/TestConfigProvider';
import { IFormFieldsValidity } from '../../models/IFormFieldsValidity';
import { SimpleMessageBus } from '../message-bus/SimpleMessageBus';
import { Validation } from './Validation';

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

jest.mock('./../message-bus/MessageBus');
jest.mock('./../notification/Notification');

describe('Validation', () => {
  describe('isCharNumber()', () => {
    const { isCharNumberTestCases } = validationFixture();

    it.each(isCharNumberTestCases)('Validation.isCharNumber', (event: KeyboardEvent, expected: boolean) => {
      expect(Validation.isCharNumber(event)).toBe(expected);
    });
  });

  describe('getValidationMessage()', () => {
    const { getValidationMessagesTestCases } = validationFixture();

    it.each(getValidationMessagesTestCases)('Validation.getValidationMessage', (validityState: ValidityState, expected: string) => {
      expect(Validation.getValidationMessage(validityState)).toBe(expected);
    });
  });

  describe('isKeyEnter()', () => {
    const { keyCodeForOther, keyCodeForEnter, eventWithOther, eventWithEnter } = validationFixture();

    it(`should return true if indicated keyCode is equal ${keyCodeForEnter}`, () => {
      expect(Validation.isEnter(eventWithEnter)).toEqual(true);
    });

    it(`should return false if indicated keyCode ${keyCodeForOther} is not equal ${keyCodeForEnter}`, () => {
      expect(Validation.isEnter(eventWithOther)).toEqual(false);
    });
  });

  describe('blockForm()', () => {
    // TODO FormState.COMPLETE
    const { instance } = validationFixture();

    it('should return state of blocking action equals blocked if MessageBus event data is true', () => {
      expect(instance.blockForm(FormState.BLOCKED)).toBe(undefined);
    });

    it('should return state of blocking action equals complete if MessageBus event data is true', () => {
      expect(instance.blockForm(FormState.COMPLETE)).toBe(undefined);
    });

    it('should return state of blocking action equals available if MessageBus event data is false', () => {
      expect(instance.blockForm(FormState.AVAILABLE)).toBe(undefined);
    });
  });

  describe('getErrorData()', () => {
    const {
      instance,
      cardNumberErrorData,
      securityCodeErrorData,
      expirationDateErrorData,
      merchantInputsErrorData,
    } = validationFixture();

    it('should pass error data with proper field equals pan', () => {
      StCodec.getErrorData(cardNumberErrorData);
      // @ts-ignore
      expect(instance.getErrorData(cardNumberErrorData)).toEqual({
        field: cardNumberErrorData.errordata[0],
        errormessage: cardNumberErrorData.errormessage,
      });
    });

    it('should pass error data with proper field equals security code', () => {
      StCodec.getErrorData(securityCodeErrorData);
      // @ts-ignore
      expect(instance.getErrorData(securityCodeErrorData)).toEqual({
        field: securityCodeErrorData.errordata[0],
        errormessage: securityCodeErrorData.errormessage,
      });
    });

    it('should pass error data with proper field equals expiration date', () => {
      StCodec.getErrorData(expirationDateErrorData);
      // @ts-ignore
      expect(instance.getErrorData(expirationDateErrorData)).toEqual({
        field: expirationDateErrorData.errordata[0],
        errormessage: expirationDateErrorData.errormessage,
      });
    });

    it('should pass error data with proper field equals merchant field', () => {
      StCodec.getErrorData(merchantInputsErrorData);
      // @ts-ignore
      expect(instance.getErrorData(merchantInputsErrorData)).toEqual({
        field: merchantInputsErrorData.errordata[0],
        errormessage: merchantInputsErrorData.errormessage,
      });
    });
  });

  describe('setCustomValidationError()', () => {
    const { inputElement, someRandomMessage } = validationFixture();

    it('should have validity equal false if validation message is set', () => {
      Validation.setCustomValidationError(someRandomMessage, inputElement);
      expect(inputElement.checkValidity()).toEqual(false);
    });

    it('should have validity equal true if validation message is not set', () => {
      Validation.setCustomValidationError('', inputElement);
      expect(inputElement.checkValidity()).toEqual(true);
    });
  });

  describe('_toggleErrorClass()', () => {
    const { instance, inputElement, messageElement } = validationFixture();

    it('should remove error class if field is valid', () => {
      inputElement.setCustomValidity('');
      // @ts-ignore
      instance.toggleErrorClass(inputElement, messageElement, Validation.ERROR_FIELD_CLASS, 'hidden');
      expect(inputElement.classList.contains(Validation.ERROR_FIELD_CLASS)).toEqual(false);
    });

    it('should add error class if field is invalid', () => {
      inputElement.setCustomValidity('some error');
      // @ts-ignore
      instance.toggleErrorClass(inputElement, messageElement, Validation.ERROR_FIELD_CLASS, 'visible');
      expect(inputElement.classList.contains(Validation.ERROR_FIELD_CLASS)).toEqual(true);
    });
  });

  describe('_getTranslation()', () => {
    const { instance, inputElement, messageElement, someRandomMessage } = validationFixture();
    const customErrorMessage = 'Some message';
    const isCardNumberInput = true;
    const isNotCardNumberInput = false;

    it(`should return '${customErrorMessage}' when it's not card number input and has messageElement and customErrorMessage defined`, () => {
      expect(
        // @ts-ignore
        instance.getTranslation(
          inputElement,
          isNotCardNumberInput,
          someRandomMessage,
          messageElement,
          customErrorMessage
        )
      ).toEqual(customErrorMessage);
    });

    it(`should return validity state - '${VALIDATION_ERROR_PATTERN_MISMATCH}' when it's card number input and has messageElement and customErrorMessage defined`, () => {
      inputElement.value = '123';
      expect(
        // @ts-ignore
        instance.getTranslation(inputElement, isCardNumberInput, someRandomMessage, messageElement, customErrorMessage)
      ).toEqual(someRandomMessage);
    });

    it(`should return '${someRandomMessage}' when it's card number input and has messageElement and customErrorMessage is not defined`, () => {
      expect(
        // @ts-ignore
        instance.getTranslation(inputElement, isNotCardNumberInput, someRandomMessage, messageElement)
      ).toEqual(someRandomMessage);
    });

    it(`should return '${VALIDATION_ERROR_PATTERN_MISMATCH}' when it's card number input and has messageElement and it's not valid`, () => {
      inputElement.setCustomValidity('test');
      expect(
        // @ts-ignore
        instance.getTranslation(inputElement, isCardNumberInput, someRandomMessage, messageElement)
      ).toEqual(VALIDATION_ERROR_PATTERN_MISMATCH);
    });
  });

  describe('formValidation', () => {
    const { instance } = validationFixture();
    const formFields = {
      expirationDate: { value: 'expirydate', validity: true },
      cardNumber: { value: 'pan', validity: false },
      securityCode: { value: 'securitycode', validity: true },
    };

    beforeEach(() => {
      instance.blockForm = jest.fn();
    });

    it('should set isFormValid and isPaymentReady to true', () => {
      // @ts-ignore
      instance.formValidation(true, ['pan', 'expirydate', 'securitycode'], formFields, false, false);
      // @ts-ignore
      expect(instance.formValidity).toEqual(true);
      // @ts-ignore
      expect(instance.isPaymentReady).toEqual(true);
    });

    it('should call blockForm method if isFormValid and isPaymentReady are true', () => {
      instance.formValidation(true, ['pan', 'expirydate', 'securitycode'], formFields, false);
      // @ts-ignore
      expect(instance.blockForm).toHaveBeenCalled();
    });

    it('should set isFormValid and card variables if dataInJwt is false', () => {
      instance.formValidation(false, ['pan', 'expirydate', 'securitycode'], formFields, false);
      // @ts-ignore
      expect(instance.formValidity).toEqual(false);
      // @ts-ignore
      expect(instance.card).toEqual({
        expirydate: 'expirydate',
        pan: 'pan',
        securitycode: 'securitycode',
      });
    });
  });

  describe('setFormValidity', () => {
    const { instance } = validationFixture();
    const validationEvent = {
      data: { testValue: 'test value' },
      type: MessageBus.EVENTS.VALIDATE_FORM,
    };

    beforeEach(() => {
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
      instance.setFormValidity({ testValue: 'test value' } as unknown as IFormFieldsValidity);
    });

    it('should call publish event', () => {
      // @ts-ignore
      expect(instance.messageBus.publish).toHaveBeenCalledWith(validationEvent);
    });
  });
});

function validationFixture() {
  const containerMock = mock(ContainerInstance);
  const testMessageBus = new SimpleMessageBus();
  const instance: Validation = new Validation(mockInstance(containerMock));

  (instance as any).messageBus = testMessageBus;

  const inputElement = document.createElement('input');
  const inputElementMerchant = document.createElement('input');
  inputElementMerchant.setAttribute('data-st-name', 'billingemail');
  const messageElement = document.createElement('label');
  const someRandomMessage = 'Release the Kraken!';
  const keyCodeForOther = 71;
  const keyCodeForEnter = 13;
  const luhnPassed = true;
  const luhnFailed = false;
  const divElement = document.createElement('div');
  const cardNumberErrorData = {
    errordata: ['pan'],
    errormessage: 'Invalid field',
  };
  const expirationDateErrorData = {
    errordata: ['expirydate'],
    errormessage: 'Invalid field',
  };
  const securityCodeErrorData: IResponseData = {
    errordata: ['securitycode'],
    errormessage: 'Invalid field',
  };
  const backendValidityData = {
    field: 'pan',
    message: 'some message',
  };
  const merchantInputsErrorData = {
    errordata: ['billingemail'],
    errormessage: 'Invalid field',
  };

  Container.get(TranslatorToken).init();

  const isCharNumberTestCases = [
    [new KeyboardEvent('keypress', { key: 'a' }), true],
    [new KeyboardEvent('keypress', { key: '0' }), false],
    [new KeyboardEvent('keypress', { key: '"' }), true],
    [new KeyboardEvent('keypress', { key: 'Shift' }), true],
  ];

  // @ts-ignore
  const eventWithEnter = new KeyboardEvent('keypress', { keyCode: keyCodeForEnter });
  // @ts-ignore
  const eventWithOther = new KeyboardEvent('keypress', { keyCode: keyCodeForOther });

  const getValidationMessagesTestCases = [
    [{ valid: true, valueMissing: false }, undefined],
    [{ valid: false, valueMissing: true }, VALIDATION_ERROR_FIELD_IS_REQUIRED],
    [{ valid: false, patternMismatch: true }, VALIDATION_ERROR_PATTERN_MISMATCH],
    [{ valid: false, customError: true }, VALIDATION_ERROR],
    [{ valid: false, tooShort: true }, VALIDATION_ERROR],
  ];
  return {
    inputElement,
    inputElementMerchant,
    instance,
    messageElement,
    someRandomMessage,
    keyCodeForOther,
    keyCodeForEnter,
    cardNumberErrorData,
    expirationDateErrorData,
    securityCodeErrorData,
    merchantInputsErrorData,
    backendValidityData,
    isCharNumberTestCases,
    getValidationMessagesTestCases,
    eventWithEnter,
    eventWithOther,
    luhnFailed,
    luhnPassed,
    divElement,
  };
}
