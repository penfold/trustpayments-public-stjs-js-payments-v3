import { takeUntil } from 'rxjs/operators';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IFormFieldState } from '../../models/IFormFieldState';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { Utils } from '../utils/Utils';
import { Validation } from '../validation/Validation';
import { onInputWraper } from '../on-input-wrapper/onInputWrapper';
import { Frame } from '../frame/Frame';
import { Container } from 'typedi';
import { NOT_IMPLEMENTED_ERROR } from '../../models/constants/Translations';
import { CARD_NUMBER_INPUT, CARD_NUMBER_WRAPPER } from '../../models/constants/Selectors';
import { AllowedStylesService } from './AllowedStylesService';
import { IMessageBus } from '../message-bus/IMessageBus';
import { MessageBusToken, TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { ITranslator } from '../translator/ITranslator';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';

export class Input {
  protected static PLACEHOLDER_ATTRIBUTE = 'placeholder';
  validation: Validation;
  protected _inputSelector: string;
  protected _labelSelector: string;
  protected _messageSelector: string;
  protected _wrapperSelector: string;
  protected _inputElement: HTMLInputElement;
  protected _labelElement: HTMLLabelElement;
  protected _messageElement: HTMLDivElement;
  protected _cardNumberInput: HTMLInputElement;
  protected placeholder: string;
  private _translator: ITranslator;
  private _frame: Frame;
  private _messageBus: IMessageBus;
  private _allowedStyles: AllowedStylesService;
  private stopSubmitFormOnEnter: boolean;

  constructor(
    inputSelector: string,
    messageSelector: string,
    labelSelector: string,
    wrapperSelector: string,
    protected configProvider: ConfigProvider
  ) {
    this._messageBus = Container.get(MessageBusToken);
    this._allowedStyles = Container.get(AllowedStylesService);
    this._frame = Container.get(Frame);
    this._translator = Container.get(TranslatorToken);
    this._cardNumberInput = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
    this._inputElement = document.getElementById(inputSelector) as HTMLInputElement;
    this._labelElement = document.getElementById(labelSelector) as HTMLLabelElement;
    this._messageElement = document.getElementById(messageSelector) as HTMLInputElement;
    this._inputSelector = inputSelector;
    this._labelSelector = labelSelector;
    this._messageSelector = messageSelector;
    this._wrapperSelector = wrapperSelector;
    this.setInputListeners();
    this.init();
  }

  init(): void {
    this.validation = new Validation();
    this.addTabListener();

    this.configProvider.getConfig$().subscribe(config => {
      this.stopSubmitFormOnEnter = Boolean(config.stopSubmitFormOnEnter);
      this.setLabelText();
      this.setAsterisk();
    });

    const destroy$ = this._messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    this._messageBus.pipe(ofType(PUBLIC_EVENTS.UPDATE_JWT), takeUntil(destroy$)).subscribe(() => this.setLabelText());
  }

  protected format(data: string): void {
    this._inputElement.value = data;
  }

  protected getAllowedStyles(): IAllowedStyles {
    let allowed = this._frame.getAllowedStyles();
    allowed = {
      ...allowed,
      ...this._allowedStyles.getStyles(
        `#${this._inputSelector}`,
        `#${this._inputSelector}.error-field`,
        `#${this._inputSelector}::placeholder`,
        `#${this._messageSelector}`,
        `label[for=${this._inputSelector}]`,
        `.${CARD_NUMBER_WRAPPER} #card-icon`,
        `.${this._wrapperSelector}`
      ),
    };
    return allowed;
  }

  protected getLabel(): string {
    throw new Error(NOT_IMPLEMENTED_ERROR);
  }

  protected getState(): IFormFieldState {
    return {
      validity: this._inputElement.validity.valid,
      value: this._inputElement.value,
    };
  }

  protected onBlur(): void {
    this.blur();
    this.validation.validate(this._inputElement, this._messageElement);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onClick(event: Event): void {
    this.click();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onFocus(event: Event): void {
    this.focus();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onInput(event: Event): void {
    this.validation.keepCursorsPosition(this._inputElement);
    Validation.setCustomValidationError('', this._inputElement);
    this.format(this._inputElement.value);
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if (Validation.isEnter(event)) {
      event.preventDefault();
      if (this._inputElement.id === CARD_NUMBER_INPUT) {
        this.validation.luhnCheck(this._cardNumberInput, this._inputElement, this._messageElement);
      }
      this.validateInput();
      this.validation.callSubmitEvent();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.validation.setOnKeyDownProperties(this._inputElement, event);
  }

  protected onPaste(event: ClipboardEvent): void {
    let { clipboardData } = event;
    event.preventDefault();
    if (this._inputElement === document.activeElement) {
      this.validation.keepCursorsPosition(this._inputElement);
    }
    if (typeof clipboardData === 'undefined') {
      // @ts-ignore
      clipboardData = window.clipboardData.getData('Text');
    } else {
      // @ts-ignore
      clipboardData = event.clipboardData.getData('text/plain');
    }

    // @ts-ignore
    this._inputElement.value = Utils.stripChars(clipboardData, undefined);
    Validation.setCustomValidationError('', this._inputElement);
    this.format(this._inputElement.value);
    this.validation.validate(this._inputElement, this._messageElement);
  }

  protected setAttributes(attributes: Record<string, string>): void {
    for (const attribute in attributes) {
      this._inputElement.setAttribute(attribute, attributes[attribute]);
    }
  }

  protected setEventListener(event: string, validate = true): void {
    this._messageBus.subscribeType(event, () => {
      if (validate) {
        this.validateInput();
      }
    });
  }

  protected setValue(value: string): void {
    this._inputElement.value = value;
  }

  protected setMessageBusEvent(event: string): IMessageBusEvent {
    const formFieldState: IFormFieldState = this.getState();
    return {
      data: formFieldState,
      type: event,
    };
  }

  private addTabListener(): void {
    window.addEventListener('focus', event => {
      this.onFocus(event);
    });
  }

  private blur(): void {
    this._inputElement.blur();
  }

  private click(): void {
    this._inputElement.click();
  }

  private focus(): void {
    this._inputElement.focus();
  }

  private setInputListeners(): void {
    this._inputElement.addEventListener('paste', (event: ClipboardEvent) => {
      this.onPaste(event);
    });

    this._inputElement.addEventListener('keypress', (event: KeyboardEvent) => {
      if (this.stopSubmitFormOnEnter && event.key === 'Enter') {
        event.preventDefault();
      } else {
        this.onKeyPress(event);
      }
    });

    this._inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
      this.onKeydown(event);
    });

    this._inputElement.addEventListener(
      'input',
      onInputWraper((event: Event) => {
        this.onInput(event);
      })
    );

    this._inputElement.addEventListener('focus', (event: Event) => {
      this.onFocus(event);
    });

    this._inputElement.addEventListener('blur', () => {
      this.onBlur();
    });

    this._inputElement.addEventListener('click', (event: Event) => {
      this.onClick(event);
    });
  }

  private setLabelText(): void {
    this._labelElement.textContent = this._translator.translate(this.getLabel());
  }

  private setAsterisk(): void {
    const isRequiredField = this._labelElement.className.split(' ').some(name => name.includes('--required'));

    if (isRequiredField) {
      const span = document.createElement('span');
      span.className = 'asterisk';
      span.textContent = '*';
      this._labelElement.appendChild(span);
    }
  }

  private validateInput(): void {
    this.format(this._inputElement.value);
    if (this._inputElement.id === CARD_NUMBER_INPUT) {
      this.validation.luhnCheck(this._cardNumberInput, this._inputElement, this._messageElement);
    }
    this.validation.validate(this._inputElement, this._messageElement);
  }
}
