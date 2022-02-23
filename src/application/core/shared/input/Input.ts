import { takeUntil } from 'rxjs/operators';
import { Container } from 'typedi';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IFormFieldState } from '../../models/IFormFieldState';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { Utils } from '../utils/Utils';
import { Validation } from '../validation/Validation';
import { onInputWraper } from '../on-input-wrapper/onInputWrapper';
import { Frame } from '../frame/Frame';
import { NOT_IMPLEMENTED_ERROR } from '../../models/constants/Translations';
import { CARD_NUMBER_INPUT, CARD_NUMBER_WRAPPER } from '../../models/constants/Selectors';
import { IMessageBus } from '../message-bus/IMessageBus';
import { MessageBusToken, TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { ITranslator } from '../translator/ITranslator';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
// @ts-ignore
import { ValidationFactory } from '../validation/ValidationFactory';
import { AllowedStylesService } from './AllowedStylesService';

export class Input {
  protected static PLACEHOLDER_ATTRIBUTE = 'placeholder';
  protected inputSelector: string;
  protected labelSelector: string;
  protected messageSelector: string;
  protected wrapperSelector: string;
  protected inputElement: HTMLInputElement;
  protected labelElement: HTMLLabelElement;
  protected messageElement: HTMLDivElement;
  protected cardNumberInput: HTMLInputElement;
  protected placeholder: string;
  protected frame: Frame;
  protected messageBus: IMessageBus;
  protected translator: ITranslator;
  private allowedStyles: AllowedStylesService;
  private stopSubmitFormOnEnter: boolean;
  protected validation: Validation;

  constructor(
    inputSelector: string,
    messageSelector: string,
    labelSelector: string,
    wrapperSelector: string,
    protected configProvider: ConfigProvider,
    protected validationFactory: ValidationFactory,
  ) {
    this.validation = this.validationFactory.create();
    this.messageBus = Container.get(MessageBusToken);
    this.allowedStyles = Container.get(AllowedStylesService);
    this.frame = Container.get(Frame);
    this.translator = Container.get(TranslatorToken);
    this.cardNumberInput = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
    this.inputElement = document.getElementById(inputSelector) as HTMLInputElement;
    this.labelElement = document.getElementById(labelSelector) as HTMLLabelElement;
    this.messageElement = document.getElementById(messageSelector) as HTMLInputElement;
    this.inputSelector = inputSelector;
    this.labelSelector = labelSelector;
    this.messageSelector = messageSelector;
    this.wrapperSelector = wrapperSelector;
    this.setInputListeners();
    this.init();
  }

  init(): void {
    this.addTabListener();

    this.configProvider.getConfig$().subscribe(config => {
      this.stopSubmitFormOnEnter = Boolean(config.stopSubmitFormOnEnter);
      this.setLabelText();
      this.setAsterisk();
    });

    const destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    this.messageBus.pipe(ofType(PUBLIC_EVENTS.UPDATE_JWT), takeUntil(destroy$)).subscribe(() => this.setLabelText());
  }

  protected format(data: string): void {
    this.inputElement.value = data;
  }

  protected getAllowedStyles(): IAllowedStyles {
    let allowed = this.frame.getAllowedStyles();
    allowed = {
      ...allowed,
      ...this.allowedStyles.getStyles(
        `#${this.inputSelector}`,
        `#${this.inputSelector}.error-field`,
        `#${this.inputSelector}::placeholder`,
        `#${this.messageSelector}`,
        `label[for=${this.inputSelector}]`,
        `.${CARD_NUMBER_WRAPPER} #card-icon`,
        `.${this.wrapperSelector}`,
      ),
    };
    return allowed;
  }

  protected getLabel(): string {
    throw new Error(NOT_IMPLEMENTED_ERROR);
  }

  protected getState(): IFormFieldState {
    return {
      validity: this.inputElement.validity.valid,
      value: this.inputElement.value,
    };
  }

  protected onBlur(): void {
    this.blur();
    this.validation.validate(this.inputElement, this.messageElement);
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
    this.validation.keepCursorsPosition(this.inputElement);
    Validation.setCustomValidationError('', this.inputElement);
    this.format(this.inputElement.value);
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if (Validation.isEnter(event)) {
      event.preventDefault();
      if (this.inputElement.id === CARD_NUMBER_INPUT) {
        this.validation.luhnCheck(this.cardNumberInput, this.inputElement, this.messageElement);
      }
      this.validateInput();
      this.validation.callSubmitEvent();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.validation.setOnKeyDownProperties(this.inputElement, event);
  }

  protected onPaste(event: ClipboardEvent): void {
    let { clipboardData } = event;
    event.preventDefault();
    if (this.inputElement === document.activeElement) {
      this.validation.keepCursorsPosition(this.inputElement);
    }
    if (typeof clipboardData === 'undefined') {
      // @ts-ignore
      clipboardData = window.clipboardData.getData('Text');
    } else {
      // @ts-ignore
      clipboardData = event.clipboardData.getData('text/plain');
    }

    // @ts-ignore
    this.inputElement.value = Utils.stripChars(clipboardData, undefined);
    Validation.setCustomValidationError('', this.inputElement);
    this.format(this.inputElement.value);
    this.validation.validate(this.inputElement, this.messageElement);
  }

  protected setAttributes(attributes: Record<string, string>): void {
    for (const attribute in attributes) {
      this.inputElement.setAttribute(attribute, attributes[attribute]);
    }
  }

  protected setEventListener(event: string, validate = true): void {
    this.messageBus.subscribeType(event, () => {
      if (validate) {
        this.validateInput();
      }
    });
  }

  protected setValue(value: string): void {
    this.inputElement.value = value;
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
    this.inputElement.blur();
  }

  private click(): void {
    this.inputElement.click();
  }

  private focus(): void {
    this.inputElement.focus({ preventScroll: true });
  }

  private setInputListeners(): void {
    this.inputElement.addEventListener('paste', (event: ClipboardEvent) => {
      this.onPaste(event);
    });

    this.inputElement.addEventListener('keypress', (event: KeyboardEvent) => {
      if (this.stopSubmitFormOnEnter && event.key === 'Enter') {
        event.preventDefault();
      } else {
        this.onKeyPress(event);
      }
    });

    this.inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
      this.onKeydown(event);
    });

    this.inputElement.addEventListener(
      'input',
      onInputWraper((event: Event) => {
        this.onInput(event);
      }),
    );

    this.inputElement.addEventListener('focus', (event: Event) => {
      this.onFocus(event);
    });

    this.inputElement.addEventListener('blur', () => {
      this.onBlur();
    });

    this.inputElement.addEventListener('click', (event: Event) => {
      this.onClick(event);
    });
  }

  private setLabelText(): void {
    this.labelElement.textContent = this.translator.translate(this.getLabel());
  }

  private setAsterisk(): void {
    const isRequiredField = this.labelElement.className.split(' ').some(name => name.includes('--required'));

    if (isRequiredField) {
      const span = document.createElement('span');
      span.className = 'asterisk';
      span.textContent = '*';
      this.labelElement.appendChild(span);
    }
  }

  private validateInput(): void {
    this.format(this.inputElement.value);
    if (this.inputElement.id === CARD_NUMBER_INPUT) {
      this.validation.luhnCheck(this.cardNumberInput, this.inputElement, this.messageElement);
    }
    this.validation.validate(this.inputElement, this.messageElement);
  }
}
