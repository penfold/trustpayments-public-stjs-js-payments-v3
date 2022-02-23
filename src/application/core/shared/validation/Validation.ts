import { iinLookup } from '@trustpayments/ts-iin-lookup';
import { BrandDetailsType } from '@trustpayments/ts-iin-lookup/dist/types';
import { luhnCheck } from '@trustpayments/ts-luhn-check';
import { Container, ContainerInstance, Service } from 'typedi';
import { StCodec } from '../../services/st-codec/StCodec';
import { FormState } from '../../models/constants/FormState';
import { ICard } from '../../models/ICard';
import { IErrorData } from '../../models/IErrorData';
import { IFormFieldState } from '../../models/IFormFieldState';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IMessageBusValidateField } from '../../models/IMessageBusValidateField';
import { IValidation } from '../../models/IValidation';
import { Frame } from '../frame/Frame';
import {
  VALIDATION_ERROR,
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
} from '../../models/constants/Translations';
import { MessageBus } from '../message-bus/MessageBus';
import { CARD_NUMBER_INPUT } from '../../models/constants/Selectors';
import { Utils } from '../utils/Utils';
import { IMessageBus } from '../message-bus/IMessageBus';
import { MessageBusToken, TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ITranslator } from '../translator/ITranslator';
import { IFormFieldsValidity } from '../../models/IFormFieldsValidity';
import { EventScope } from '../../models/constants/EventScope';

@Service()
export class Validation {
  static ERROR_FIELD_CLASS = 'error-field';

  static clearNonDigitsChars(value: string): string {
    return value.replace(Validation.ESCAPE_DIGITS_REGEXP, Validation.CLEAR_VALUE);
  }

  static getValidationMessage(state: ValidityState): string {
    const { patternMismatch, valid, valueMissing } = state;
    if (!valid) {
      if (valueMissing) {
        return VALIDATION_ERROR_FIELD_IS_REQUIRED;
      } else if (patternMismatch) {
        return VALIDATION_ERROR_PATTERN_MISMATCH;
      } else {
        return VALIDATION_ERROR;
      }
    }
  }

  static isCharNumber(event: KeyboardEvent): boolean {
    const key: string = event.key;
    const regex = new RegExp(Validation.ESCAPE_DIGITS_REGEXP);
    return regex.test(key);
  }

  static isEnter(event: KeyboardEvent): boolean {
    if (event) {
      const keyCode: number = event.keyCode;
      return keyCode === Validation.ENTER_KEY_CODE;
    } else {
      return false;
    }
  }

  static setCustomValidationError(errorContent: string, inputElement: HTMLInputElement): void {
    inputElement.setCustomValidity(errorContent);
  }

  static addErrorContainer(inputElement: HTMLInputElement, inputTarget: InsertPosition, errorContent: string): void {
    inputElement.insertAdjacentHTML(inputTarget, errorContent);
  }

  static resetValidationProperties(input: HTMLInputElement): void {
    input.setCustomValidity(Validation.CLEAR_VALUE);
    input.classList.remove(Validation.ERROR_FIELD_CLASS);
    input.nextSibling.textContent = Validation.CLEAR_VALUE;
  }

  static returnInputAndErrorContainerPair(item: HTMLInputElement): { inputElement: HTMLInputElement, messageElement: HTMLElement } {
    return {
      inputElement: document.getElementById(item.id) as HTMLInputElement,
      messageElement: document.getElementById(item.id).nextSibling as HTMLElement,
    };
  }

  private static BACKSPACE_KEY_CODE = 8;
  private static CARD_NUMBER_DEFAULT_LENGTH = 16;
  private static CARD_NUMBER_FIELD_NAME = 'pan';
  private static CLEAR_VALUE = '';
  private static DELETE_KEY_CODE = 46;
  private static ENTER_KEY_CODE = 13;
  private static ERROR_CLASS = 'error';
  private static ESCAPE_DIGITS_REGEXP = /[^\d]/g;
  private static EXPIRY_DATE_FIELD_NAME = 'expirydate';
  private static ID_PARAM_NAME = 'id';
  private static MATCH_CHARS = /[^\d]/g;
  private static MATCH_DIGITS = /^[0-9]*$/;
  private static MERCHANT_EXTRA_FIELDS_PREFIX = 'billing';
  private static SECURITY_CODE_FIELD_NAME = 'securitycode';
  private static BACKEND_ERROR_FIELDS_NAMES = {
    cardNumber: 'pan',
    expirationDate: 'expirydate',
    securityCode: 'securitycode',
  };

  private static setValidateEvent(errordata: string, event: IMessageBusEvent): IMessageBusEvent {
    switch (errordata) {
      case Validation.BACKEND_ERROR_FIELDS_NAMES.cardNumber:
        event.type = MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD;
        break;
      case Validation.BACKEND_ERROR_FIELDS_NAMES.expirationDate:
        event.type = MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD;
        break;
      case Validation.BACKEND_ERROR_FIELDS_NAMES.securityCode:
        event.type = MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD;
        break;
    }
    return event;
  }

  private static isFormValid(
    formFields: {
      cardNumber: IFormFieldState;
      expirationDate: IFormFieldState;
      securityCode: IFormFieldState;
    },
    fieldsToSubmit: string[],
  ): boolean {
    const isPanValid: boolean = fieldsToSubmit.includes(Validation.CARD_NUMBER_FIELD_NAME)
      ? formFields.cardNumber.validity
      : true;
    const isExpiryDateValid: boolean = fieldsToSubmit.includes(Validation.EXPIRY_DATE_FIELD_NAME)
      ? formFields.expirationDate.validity
      : true;
    const isSecurityCodeValid: boolean =
      fieldsToSubmit.includes(Validation.SECURITY_CODE_FIELD_NAME) ? formFields.securityCode.validity : true;
    return isPanValid && isExpiryDateValid && isSecurityCodeValid;
  }

  cardDetails: BrandDetailsType;
  cardNumberValue: string;
  expirationDateValue: string;
  securityCodeValue: string;
  validation: IValidation;
  private card: ICard;
  private currentKeyCode: number;
  private formValidity: boolean;
  private isPaymentReady: boolean;
  private matchDigitsRegexp: RegExp;
  private selectionRangeEnd: number;
  private selectionRangeStart: number;
  private messageBus: IMessageBus;
  private frame: Frame;

  constructor(private container: ContainerInstance, private translator: ITranslator = Container.get(TranslatorToken)) {
    this.messageBus = this.container.get(MessageBusToken);
    this.frame = this.container.get(Frame);
    this.init();
  }

  backendValidation(inputElement: HTMLInputElement, messageElement: HTMLElement, event: string): void {
    this.messageBus.subscribeType(event, (data: IMessageBusValidateField) => {
      this.setError(inputElement, messageElement, data);
    });
  }

  blockForm(state: FormState): void {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM,
    };
    this.messageBus.publish(messageBusEvent,  EventScope.ALL_FRAMES);
  }

  callSubmitEvent(): void {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.CALL_SUBMIT_EVENT,
    };
    this.messageBus.publish(messageBusEvent,  EventScope.ALL_FRAMES);
  }

  formValidation(
    dataInJwt: boolean,
    fieldsToSubmit: string[],
    formFields: {
      cardNumber: IFormFieldState;
      expirationDate: IFormFieldState;
      securityCode: IFormFieldState;
    },
    paymentReady: boolean
  ): { card: ICard; validity: boolean } {
    this.setValidationResult(dataInJwt, fieldsToSubmit, formFields, paymentReady);
    const isFormReadyToSubmit: boolean = this.isFormReadyToSubmit();
    if (isFormReadyToSubmit) {
      this.blockForm(FormState.BLOCKED);
    }
    return {
      card: this.card,
      validity: isFormReadyToSubmit,
    };
  }

  getErrorData(errorData: IErrorData): { field: unknown, errormessage: unknown } {
    // @ts-ignore
    const { errordata, errormessage } = StCodec.getErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: Validation.CLEAR_VALUE,
    };

    this.broadcastFormFieldError(errordata[0], validationEvent);

    if (errordata.find((element: string) => element.includes(Validation.MERCHANT_EXTRA_FIELDS_PREFIX))) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD;
      this.messageBus.publish(validationEvent);
    }

    return { field: errordata[0], errormessage };
  }

  keepCursorsPosition(element: HTMLInputElement): void {
    const cursorSingleSkip = 1;
    const cursorDoubleSkip = 2;
    const dateSlash = '/';
    const end: number = this.selectionRangeEnd;
    const start: number = this.selectionRangeStart;
    const noSelection = 0;
    const selectionLength: number = start - end;
    const spaceInPan = ' ';
    const lengthFormatted: number = element.value.length;
    const isLastCharSlash: boolean = element.value.charAt(lengthFormatted - cursorDoubleSkip) === dateSlash;

    if (this.isPressedKeyDelete()) {
      element.setSelectionRange(start, end);
    } else if (this.isPressedKeyBackspace()) {
      element.setSelectionRange(start - cursorSingleSkip, end - cursorSingleSkip);
    } else if (isLastCharSlash || (element.value.charAt(end) === spaceInPan && selectionLength === noSelection)) {
      element.setSelectionRange(start + cursorDoubleSkip, end + cursorDoubleSkip);
    } else if (selectionLength === noSelection) {
      element.setSelectionRange(start + cursorSingleSkip, end + cursorSingleSkip);
    } else {
      element.setSelectionRange(start + cursorSingleSkip, start + cursorSingleSkip);
    }
  }

  luhnCheck(field: HTMLInputElement, input: HTMLInputElement, message: HTMLDivElement): void {
    const { value } = input;
    if (!luhnCheck(value)) {
      Validation.setCustomValidationError(VALIDATION_ERROR_PATTERN_MISMATCH, field);
      this.validate(input, message, VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      Validation.setCustomValidationError(Validation.CLEAR_VALUE, field);
    }
  }

  limitLength(value: string, length: number): string {
    return value ? value.substring(0, length) : Validation.CLEAR_VALUE;
  }

  removeError(element: HTMLInputElement, errorContainer: HTMLElement): void {
    element.classList.remove(Validation.ERROR_CLASS);
    errorContainer.textContent = Validation.CLEAR_VALUE;
  }

  setError(inputElement: HTMLInputElement, messageElement: HTMLElement, data: IMessageBusValidateField): void {
    const { message } = data;
    if (message && messageElement && messageElement.innerText !== VALIDATION_ERROR_PATTERN_MISMATCH) {
      messageElement.innerText = this.translator.translate(message);
      inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
      messageElement.style.visibility = 'visible';
      inputElement.setCustomValidity(message);
    } else {
      inputElement.classList.remove(Validation.ERROR_FIELD_CLASS);
      messageElement.style.visibility = 'hidden';
      inputElement.setCustomValidity(message);
    }
  }

  setOnKeyDownProperties(element: HTMLInputElement, event: KeyboardEvent): void {
    this.currentKeyCode = event.keyCode;
    this.selectionRangeStart = element.selectionStart;
    this.selectionRangeEnd = element.selectionEnd;
  }

  setFormValidity(state: IFormFieldsValidity): void {
    const validationEvent: IMessageBusEvent = {
      data: { ...state },
      type: MessageBus.EVENTS.VALIDATE_FORM,
    };
    this.messageBus.publish(validationEvent);
  }

  validate(inputElement: HTMLInputElement, messageElement: HTMLElement, customErrorMessage?: string): void {
    this.toggleErrorClass(inputElement);
    this.toggleErrorContainer(inputElement, messageElement);
    this.setMessage(inputElement, messageElement, customErrorMessage);
  }

  init(): void {
    this.matchDigitsRegexp = new RegExp(Validation.MATCH_DIGITS);
  }

  removeNonDigits(value: string): string {
    if (value) {
      return value.replace(Validation.MATCH_CHARS, Validation.CLEAR_VALUE);
    }
  }

  getCardDetails(cardNumber: string = Validation.CLEAR_VALUE): BrandDetailsType {
    return iinLookup.lookup(cardNumber);
  }

  cardNumber(value: string): void {
    this.cardNumberValue = this.removeNonDigits(value);
    this.cardDetails = this.getCardDetails(this.cardNumberValue);
    const length = this.cardDetails.type
      ? Utils.getLastElementOfArray(this.cardDetails.length)
      : Validation.CARD_NUMBER_DEFAULT_LENGTH;
    this.cardNumberValue = this.limitLength(this.cardNumberValue, length);
  }

  expirationDate(value: string): void {
    this.expirationDateValue = value ? this.removeNonDigits(value) : Validation.CLEAR_VALUE;
  }

  securityCode(value: string, length: number): void {
    this.securityCodeValue = value ? this.limitLength(this.removeNonDigits(value), length) : Validation.CLEAR_VALUE;
  }

  private broadcastFormFieldError(errordata: string, event: IMessageBusEvent): void {
    this.messageBus.publish(Validation.setValidateEvent(errordata, event));
  }

  private getTranslation(
    inputElement: HTMLInputElement,
    isCardNumberInput: boolean,
    validityState: string,
    messageElement?: HTMLElement,
    customErrorMessage?: string
  ): string {
    if (messageElement && customErrorMessage && !isCardNumberInput) {
      return this.translator.translate(customErrorMessage);
    } else if (messageElement && inputElement.value && isCardNumberInput && !inputElement.validity.valid) {
      return this.translator.translate(VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      return this.translator.translate(validityState);
    }
  }

  private isFormReadyToSubmit(): boolean {
    return this.isPaymentReady && this.formValidity;
  }

  private isPressedKeyBackspace(): boolean {
    return this.currentKeyCode === Validation.BACKSPACE_KEY_CODE;
  }

  private isPressedKeyDelete(): boolean {
    return this.currentKeyCode === Validation.DELETE_KEY_CODE;
  }

  private setMessage(inputElement: HTMLInputElement, messageElement: HTMLElement, customErrorMessage?: string): void {
    const isCardNumberInput: boolean = inputElement.getAttribute(Validation.ID_PARAM_NAME) === CARD_NUMBER_INPUT;
    const validityState = Validation.getValidationMessage(inputElement.validity);
    messageElement.innerText = this.getTranslation(
      inputElement,
      isCardNumberInput,
      validityState,
      messageElement,
      customErrorMessage
    );
  }

  private toggleErrorContainer(inputElement: HTMLInputElement, messageElement: HTMLElement): void {
    inputElement.validity.valid
      ? (messageElement.style.visibility = 'hidden')
      : (messageElement.style.visibility = 'visible');
  }

  private toggleErrorClass(inputElement: HTMLInputElement): void {
    inputElement.validity.valid
      ? inputElement.classList.remove(Validation.ERROR_FIELD_CLASS)
      : inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
  }

  private setValidationResult(
    dataInJwt: boolean,
    fieldsToSubmit: string[],
    formFields: {
      cardNumber: IFormFieldState;
      expirationDate: IFormFieldState;
      securityCode: IFormFieldState;
    },
    paymentReady: boolean
  ): void {
    if (dataInJwt) {
      this.formValidity = true;
      this.isPaymentReady = true;
    } else {
      this.formValidity = Validation.isFormValid(formFields, fieldsToSubmit);
      this.isPaymentReady = paymentReady;
      this.card = {
        expirydate: formFields.expirationDate.value,
        pan: formFields.cardNumber.value,
        securitycode: formFields.securityCode.value,
      };
    }
  }
}
