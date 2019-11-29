import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

class ExpirationDate extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static DISABLE_FIELD_CLASS: string = 'st-input--disabled';
  private static DISABLE_STATE: string = 'disabled';
  private static EXPIRATION_DATE_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private _currentKeyCode: number;
  private _formatter: Formatter;
  private _inputSelectionEnd: number;
  private _inputSelectionStart: number;

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);
    this._formatter = new Formatter();
    this._init();
  }

  public getLabel(): string {
    return Language.translations.LABEL_EXPIRATION_DATE;
  }

  public setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_EXPIRATION_DATE, (state: boolean) => {
      state ? this._disableInputField() : this._enableInputField();
    });
  }

  protected format(date: string) {
    this.setValue(date);
  }

  protected onBlur() {
    super.onBlur();
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
    this._sendState();
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this._inputElement.value = this.validation.limitLength(
      this._inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
    this.validation.keepCursorAtSamePosition(this._inputElement);
    this._sendState();
  }

  protected onKeydown(event: KeyboardEvent) {
    super.onKeydown(event);
    this._currentKeyCode = event.keyCode;
    this._inputSelectionStart = this._inputElement.selectionStart;
    this._inputSelectionEnd = this._inputElement.selectionEnd;
    return event;
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    this._inputElement.focus();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._inputElement.value = this.validation.limitLength(
      this._inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
    this._sendState();
  }

  private _init() {
    super.setEventListener(MessageBus.EVENTS.BLUR_EXPIRATION_DATE);
    super.setEventListener(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE);
    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });
    this.setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
    );
  }

  private _sendState() {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE);
    this._messageBus.publish(messageBusEvent);
  }

  private _disableInputField() {
    this._inputElement.setAttribute(ExpirationDate.DISABLE_STATE, 'true');
    this._inputElement.classList.add(ExpirationDate.DISABLE_FIELD_CLASS);
  }

  private _enableInputField() {
    this._inputElement.removeAttribute(ExpirationDate.DISABLE_STATE);
    this._inputElement.classList.remove(ExpirationDate.DISABLE_FIELD_CLASS);
  }
}

export default ExpirationDate;
