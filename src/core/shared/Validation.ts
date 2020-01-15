import { StCodec } from '../classes/StCodec.class';
import { BrandDetailsType } from '../imports/cardtype';
import { ICard } from '../models/ICard';
import { IErrorData } from '../models/IErrorData';
import { IFormFieldState } from '../models/IFormFieldState';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IMessageBusValidateField } from '../models/IMessageBusValidateField';
import { IValidation } from '../models/IValidation';
import { BinLookup } from './BinLookup';
import { Frame } from './Frame';
import { Language } from './Language';
import { MessageBus } from './MessageBus';
import { Selectors } from './Selectors';
import { Translator } from './Translator';
import { Utils } from './Utils';

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR
} = Language.translations;

export class Validation extends Frame {
  public static ERROR_FIELD_CLASS: string = 'error-field';

  public static clearNonDigitsChars(value: string): string {
    return value.replace(Validation.ESCAPE_DIGITS_REGEXP, Validation.CLEAR_VALUE);
  }

  public static getValidationMessage(state: ValidityState): string {
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

  public static isCharNumber(event: KeyboardEvent): boolean {
    const key: string = event.key;
    const regex = new RegExp(Validation.ESCAPE_DIGITS_REGEXP);
    return regex.test(key);
  }

  public static isEnter(event: KeyboardEvent): boolean {
    if (event) {
      const keyCode: number = event.keyCode;
      return keyCode === Validation.ENTER_KEY_CODE;
    } else {
      return false;
    }
  }

  public static setCustomValidationError(errorContent: string, inputElement: HTMLInputElement) {
    inputElement.setCustomValidity(errorContent);
  }

  public static addErrorContainer(inputElement: HTMLInputElement, inputTarget: InsertPosition, errorContent: string) {
    inputElement.insertAdjacentHTML(inputTarget, errorContent);
  }

  public static resetValidationProperties(input: HTMLInputElement): void {
    input.setCustomValidity(Validation.CLEAR_VALUE);
    input.classList.remove(Validation.ERROR_FIELD_CLASS);
    input.nextSibling.textContent = Validation.CLEAR_VALUE;
  }

  public static returnInputAndErrorContainerPair(item: HTMLInputElement) {
    return {
      inputElement: document.getElementById(item.id) as HTMLInputElement,
      messageElement: document.getElementById(item.id).nextSibling as HTMLElement
    };
  }

  protected static STANDARD_FORMAT_PATTERN: string = '(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?';
  private static BACKSPACE_KEY_CODE: number = 8;
  private static CARD_NUMBER_DEFAULT_LENGTH: number = 16;
  private static CARD_NUMBER_FIELD_NAME: string = 'pan';
  private static CLEAR_VALUE: string = '';
  private static CURSOR_SINGLE_SKIP: number = 1;
  private static CURSOR_DOUBLE_SKIP: number = 2;
  private static DELETE_KEY_CODE: number = 46;
  private static ENTER_KEY_CODE = 13;
  private static ERROR_CLASS: string = 'error';
  private static ESCAPE_DIGITS_REGEXP = /[^\d]/g;
  private static EXPIRATION_DATE_SLASH: string = '/';
  private static EXPIRY_DATE_FIELD_NAME: string = 'expirydate';
  private static ID_PARAM_NAME: string = 'id';
  private static MATCH_CHARS = /[^\d]/g;
  private static MATCH_DIGITS = /^[0-9]*$/;
  private static MERCHANT_EXTRA_FIELDS_PREFIX = 'billing';
  private static LUHN_CHECK_ARRAY: number[] = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  private static SECURITY_CODE_FIELD_NAME: string = 'securitycode';
  private static SPACE_IN_PAN: string = ' ';
  private static BACKEND_ERROR_FIELDS_NAMES = {
    cardNumber: Validation.CARD_NUMBER_FIELD_NAME,
    expirationDate: Validation.EXPIRY_DATE_FIELD_NAME,
    securityCode: Validation.SECURITY_CODE_FIELD_NAME
  };

  private static _luhnAlgorithm(cardNumber: string): boolean {
    const cardNumberWithoutSpaces = cardNumber.replace(/\s/g, Validation.CLEAR_VALUE);
    let bit = 1;
    let cardNumberLength = cardNumberWithoutSpaces.length;
    let sum = 0;

    while (cardNumberLength) {
      const val = parseInt(cardNumberWithoutSpaces.charAt(--cardNumberLength), 10);
      bit = bit ^ 1;
      const algorithmValue = bit ? Validation.LUHN_CHECK_ARRAY[val] : val;
      sum += algorithmValue;
    }
    return sum && sum % 10 === 0;
  }

  private static _setValidateEvent(errordata: string, event: IMessageBusEvent): IMessageBusEvent {
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

  private static _isFormValid(
    formFields: {
      cardNumber: IFormFieldState;
      expirationDate: IFormFieldState;
      securityCode: IFormFieldState;
    },
    fieldsToSubmit: string[],
    isPanPiba: boolean
  ): boolean {
    const isPanValid: boolean = fieldsToSubmit.includes(Validation.CARD_NUMBER_FIELD_NAME)
      ? formFields.cardNumber.validity
      : true;
    const isExpiryDateValid: boolean = fieldsToSubmit.includes(Validation.EXPIRY_DATE_FIELD_NAME)
      ? formFields.expirationDate.validity
      : true;
    const isSecurityCodeValid: boolean =
      fieldsToSubmit.includes(Validation.SECURITY_CODE_FIELD_NAME) && !isPanPiba
        ? formFields.securityCode.validity
        : true;
    return isPanValid && isExpiryDateValid && isSecurityCodeValid;
  }

  private static _toggleErrorClass(inputElement: HTMLInputElement) {
    if (inputElement.validity.valid) {
      inputElement.classList.remove(Validation.ERROR_FIELD_CLASS);
    } else {
      inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
    }
  }

  public cardDetails: any;
  public cardNumberValue: string;
  public expirationDateValue: string;
  public securityCodeValue: string;
  public validation: IValidation;
  protected binLookup: BinLookup;
  protected messageBus: MessageBus;
  private _card: ICard;
  private _currentKeyCode: number;
  private _cursorSkip: number = 0;
  private _formValidity: boolean;
  private _isPaymentReady: boolean;
  private _matchDigitsRegexp: RegExp;
  private _selectionRangeEnd: number;
  private _selectionRangeStart: number;
  private _translator: Translator;

  constructor() {
    super();
    this.onInit();
  }

  public backendValidation(inputElement: HTMLInputElement, messageElement: HTMLElement, event: string) {
    this.messageBus.subscribe(event, (data: IMessageBusValidateField) => {
      this.setError(inputElement, messageElement, data);
    });
  }

  public blockForm(state: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: MessageBus.EVENTS.BLOCK_FORM
    };
    this.messageBus.publish(messageBusEvent, true);
  }

  public callSubmitEvent() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS.CALL_SUBMIT_EVENT
    };
    this.messageBus.publish(messageBusEvent, true);
  }

  public formValidation(
    dataInJwt: boolean,
    deferInit: boolean,
    fieldsToSubmit: string[],
    formFields: {
      cardNumber: IFormFieldState;
      expirationDate: IFormFieldState;
      securityCode: IFormFieldState;
    },
    isPanPiba: boolean,
    paymentReady: boolean
  ): { card: ICard; validity: boolean } {
    this._setValidationResult(dataInJwt, fieldsToSubmit, formFields, isPanPiba, paymentReady);
    const isFormReadyToSubmit: boolean = this._isFormReadyToSubmit(deferInit);
    if (isFormReadyToSubmit) {
      this.blockForm(true);
    }
    return {
      card: this._card,
      validity: isFormReadyToSubmit
    };
  }

  public getErrorData(errorData: IErrorData) {
    const { errordata, errormessage } = StCodec.getErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: Validation.CLEAR_VALUE
    };

    this._broadcastFormFieldError(errordata[0], validationEvent);

    if (errordata.find((element: string) => element.includes(Validation.MERCHANT_EXTRA_FIELDS_PREFIX))) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD;
      this.messageBus.publish(validationEvent, true);
    }

    return { field: errordata[0], errormessage };
  }

  public keepCursorsPosition(element: HTMLInputElement) {
    const lengthFormatted: number = element.value.length;
    const isLastCharSlash: boolean =
      element.value.charAt(lengthFormatted - Validation.CURSOR_DOUBLE_SKIP) === Validation.EXPIRATION_DATE_SLASH;
    const start: number = this._selectionRangeStart;
    const end: number = this._selectionRangeEnd;

    if (this._isPressedKeyDelete()) {
      element.setSelectionRange(start, end);
    } else if (this._isPressedKeyBackspace()) {
      element.setSelectionRange(start - Validation.CURSOR_SINGLE_SKIP, end - Validation.CURSOR_SINGLE_SKIP);
    } else if (isLastCharSlash) {
      ++this._cursorSkip;
      element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
    } else if (element.value.charAt(end) === Validation.SPACE_IN_PAN) {
      ++this._cursorSkip;
      element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
    } else {
      element.setSelectionRange(start + Validation.CURSOR_SINGLE_SKIP, end + Validation.CURSOR_SINGLE_SKIP);
    }
  }

  public luhnCheck(field: HTMLInputElement, input: HTMLInputElement, message: HTMLDivElement) {
    const { value } = input;
    const isLuhnOk: boolean = Validation._luhnAlgorithm(value);
    if (!isLuhnOk) {
      Validation.setCustomValidationError(Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH, field);
      this.validate(input, message, Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      Validation.setCustomValidationError(Validation.CLEAR_VALUE, field);
    }
  }

  public limitLength(value: string, length: number): string {
    return value ? value.substring(0, length) : Validation.CLEAR_VALUE;
  }

  public removeError(element: HTMLInputElement, errorContainer: HTMLElement) {
    element.classList.remove(Validation.ERROR_CLASS);
    errorContainer.textContent = Validation.CLEAR_VALUE;
  }

  public setError(inputElement: HTMLInputElement, messageElement: HTMLElement, data: IMessageBusValidateField) {
    const { message } = data;
    if (
      message &&
      messageElement &&
      messageElement.innerText !== Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH
    ) {
      messageElement.innerText = this._translator.translate(message);
      inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
      inputElement.setCustomValidity(message);
    } else {
      inputElement.setCustomValidity(message);
    }
  }

  public setOnKeyDownProperties(element: HTMLInputElement, event: KeyboardEvent) {
    this._currentKeyCode = event.keyCode;
    this._selectionRangeStart = element.selectionStart;
    this._selectionRangeEnd = element.selectionEnd;
  }

  public setFormValidity(state: any) {
    const validationEvent: IMessageBusEvent = {
      data: { ...state },
      type: MessageBus.EVENTS.VALIDATE_FORM
    };
    this.messageBus.publish(validationEvent, true);
  }

  public validate(inputElement: HTMLInputElement, messageElement: HTMLElement, customErrorMessage?: string) {
    Validation._toggleErrorClass(inputElement);
    this._setMessage(inputElement, messageElement, customErrorMessage);
  }

  protected onInit() {
    super.onInit();
    this.messageBus = new MessageBus();
    this.binLookup = new BinLookup();
    this._matchDigitsRegexp = new RegExp(Validation.MATCH_DIGITS);
    this._translator = new Translator(this.params.locale);
  }

  protected removeNonDigits(value: string): string {
    if (value) {
      return value.replace(Validation.MATCH_CHARS, Validation.CLEAR_VALUE);
    }
  }

  protected getCardDetails(cardNumber: string = Validation.CLEAR_VALUE): BrandDetailsType {
    return this.binLookup.binLookup(cardNumber);
  }

  protected cardNumber(value: string) {
    this.cardNumberValue = this.removeNonDigits(value);
    this.cardDetails = this.getCardDetails(this.cardNumberValue);
    const length = this.cardDetails.type
      ? Utils.getLastElementOfArray(this.cardDetails.length)
      : Validation.CARD_NUMBER_DEFAULT_LENGTH;
    this.cardNumberValue = this.limitLength(this.cardNumberValue, length);
  }

  protected expirationDate(value: string) {
    this.expirationDateValue = value ? this.removeNonDigits(value) : Validation.CLEAR_VALUE;
  }

  protected securityCode(value: string, length: number) {
    this.securityCodeValue = value ? this.limitLength(this.removeNonDigits(value), length) : Validation.CLEAR_VALUE;
  }

  private _broadcastFormFieldError(errordata: string, event: IMessageBusEvent) {
    this.messageBus.publish(Validation._setValidateEvent(errordata, event));
  }

  private _getTranslation(
    inputElement: HTMLInputElement,
    isCardNumberInput: boolean,
    validityState: string,
    messageElement?: HTMLElement,
    customErrorMessage?: string
  ): string {
    if (messageElement && customErrorMessage && !isCardNumberInput) {
      return this._translator.translate(customErrorMessage);
    } else if (messageElement && inputElement.value && isCardNumberInput && !inputElement.validity.valid) {
      return this._translator.translate(Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      return this._translator.translate(validityState);
    }
  }

  private _isFormReadyToSubmit(deferInit: boolean): boolean {
    return (this._isPaymentReady && this._formValidity) || (deferInit && this._formValidity);
  }

  private _isPressedKeyBackspace(): boolean {
    return this._currentKeyCode === Validation.BACKSPACE_KEY_CODE;
  }

  private _isPressedKeyDelete(): boolean {
    return this._currentKeyCode === Validation.DELETE_KEY_CODE;
  }

  private _setMessage(inputElement: HTMLInputElement, messageElement: HTMLElement, customErrorMessage?: string) {
    const isCardNumberInput: boolean =
      inputElement.getAttribute(Validation.ID_PARAM_NAME) === Selectors.CARD_NUMBER_INPUT;
    const validityState = Validation.getValidationMessage(inputElement.validity);
    messageElement.innerText = this._getTranslation(
      inputElement,
      isCardNumberInput,
      validityState,
      messageElement,
      customErrorMessage
    );
  }

  private _setValidationResult(
    dataInJwt: boolean,
    fieldsToSubmit: string[],
    formFields: {
      cardNumber: IFormFieldState;
      expirationDate: IFormFieldState;
      securityCode: IFormFieldState;
    },
    isPanPiba: boolean,
    paymentReady: boolean
  ) {
    if (dataInJwt) {
      this._formValidity = true;
      this._isPaymentReady = true;
    } else {
      this._formValidity = Validation._isFormValid(formFields, fieldsToSubmit, isPanPiba);
      this._isPaymentReady = paymentReady;
      this._card = {
        expirydate: formFields.expirationDate.value,
        pan: formFields.cardNumber.value,
        securitycode: formFields.securityCode.value
      };
    }
  }
}
