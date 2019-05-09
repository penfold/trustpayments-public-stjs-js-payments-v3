import Formatter from './Formatter';
import Frame from './Frame';
import MessageBus from './MessageBus';
import { Translator } from './Translator';
import Validation from './Validation';
import Language from './Language';

export default class FormField extends Frame {
  protected _inputSelector: string;
  protected _messageSelector: string;
  protected _labelSelector: string;
  protected _inputElement: HTMLInputElement;
  protected _messageElement: HTMLParagraphElement;
  protected _labelElement: HTMLLabelElement;
  protected _messageBus: MessageBus;
  private _translator: Translator;

  constructor(inputSelector: string, messageSelector: string, labelSelector: string) {
    super();
    // @ts-ignore
    this._inputElement = document.getElementById(inputSelector);
    // @ts-ignore
    this._messageElement = document.getElementById(messageSelector);
    // @ts-ignore
    this._labelElement = document.getElementById(labelSelector);

    this._inputSelector = inputSelector;
    this._messageSelector = messageSelector;
    this._labelSelector = labelSelector;
    // @ts-ignore
    this._messageBus = new MessageBus();
    this.setInputListeners();
    this.onInit();
  }

  public onInit() {
    super.onInit();
    this._translator = new Translator(this._params.locale);
    this.setLabelText();
  }

  public getLabel(): string {
    throw new Error(Language.translations.NOT_IMPLEMENTED_ERROR);
  }

  protected setLabelText() {
    this._labelElement.innerHTML = this._translator.translate(this.getLabel());
  }

  protected _getAllowedStyles() {
    let allowed = super._getAllowedStyles();
    const input = `#${this._inputSelector}`;
    const inputError = `${input}:invalid`;
    const inputPlaceholder = `${input}::placeholder`;
    const message = `#${this._messageSelector}`;
    const label = `label[for=${this._inputSelector}]`;
    allowed = {
      ...allowed,
      'background-color-input': { property: 'background-color', selector: input },
      'background-color-input-error': {
        property: 'background-color',
        selector: inputError
      },
      'border-color-input': { property: 'border-color', selector: input },
      'border-color-input-error': { property: 'border-color', selector: inputError },
      'border-radius-input': { property: 'border-radius', selector: input },
      'border-radius-input-error': { property: 'border-radius', selector: inputError },
      'border-size-input': { property: 'border-width', selector: input },
      'border-size-input-error': { property: 'border-width', selector: inputError },
      'color-error': { property: 'color', selector: message },
      'color-input': { property: 'color', selector: input },
      'color-input-error': { property: 'color', selector: inputError },
      'color-input-placeholder': { property: 'color', selector: inputPlaceholder },
      'color-label': { property: 'color', selector: label },
      'display-label': { property: 'display', selector: label },
      'font-size-input': { property: 'font-size', selector: input },
      'font-size-input-error': { property: 'font-size', selector: inputError },
      'font-size-label': { property: 'font-size', selector: label },
      'font-size-message': { property: 'font-size', selector: message },
      'line-height-input': { property: 'line-height', selector: input },
      'line-height-input-error': { property: 'line-height', selector: inputError },
      'line-height-label': { property: 'line-height', selector: label },
      'line-height-message': { property: 'line-height', selector: message },
      'space-inset-input': { property: 'padding', selector: input },
      'space-inset-input-error': { property: 'padding', selector: inputError },
      'space-outset-input': { property: 'margin', selector: input },
      'space-outset-input-error': { property: 'margin', selector: inputError }
    };
    return allowed;
  }

  protected getState(): IFormFieldState {
    return {
      validity: this._inputElement.validity.valid,
      value: this._inputElement.value
    };
  }

  protected onKeyPress(event: KeyboardEvent) {
    if (!Validation.isCharNumber(event)) {
      event.preventDefault();
      if (Validation.isEnter(event)) {
        const messageBusEvent: IMessageBusEvent = {
          type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
        };
        this._messageBus.publish(messageBusEvent);
      }
    }
  }

  protected onInput(event: Event) {
    this.format(this._inputElement.value);
    this.validate();
  }

  protected onFocus(event: Event) {
    this.focus();
  }

  protected onBlur(event: Event) {
    this.blur();
  }

  protected onPaste(event: ClipboardEvent) {
    let clipboardData: string;

    event.preventDefault();

    clipboardData = event.clipboardData.getData('text/plain');
    this._inputElement.value = Formatter.trimNonNumeric(clipboardData);
    this.validate();
  }

  protected setAttributes(attributes: object) {
    // tslint:disable-next-line:forin
    for (const attribute in attributes) {
      // @ts-ignore
      this._inputElement.setAttribute(attribute, attributes[attribute]);
    }
  }

  /**
   * Method placed errorMessage inside chosen container (specified by id).
   * @param messageText
   */
  protected setMessage(messageText: string) {
    this._messageElement.innerText = this._translator.translate(messageText);
  }

  protected setValue(value: string) {
    this._inputElement.value = value;
  }

  protected validate() {
    const validationMessage: string = Validation.getValidationMessage(this._inputElement.validity);
    this.setMessage(validationMessage);
  }

  protected format(data: string) {
    this._inputElement.value = data;
  }

  protected blur() {
    this._inputElement.blur();
  }

  protected focus() {
    this._inputElement.focus();
  }

  private setInputListeners() {
    this._inputElement.addEventListener('paste', (event: ClipboardEvent) => {
      this.onPaste(event);
    });

    this._inputElement.addEventListener('keypress', (event: KeyboardEvent) => {
      this.onKeyPress(event);
    });

    this._inputElement.addEventListener('input', (event: Event) => {
      this.onInput(event);
    });

    this._inputElement.addEventListener('focus', (event: Event) => {
      this.onFocus(event);
    });

    this._inputElement.addEventListener('blur', (event: Event) => {
      this.onBlur(event);
    });
  }
}
