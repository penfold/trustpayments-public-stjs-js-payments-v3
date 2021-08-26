import { FormState } from '../../core/models/constants/FormState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import {
  EXPIRATION_DATE_INPUT,
  EXPIRATION_DATE_LABEL,
  EXPIRATION_DATE_MESSAGE,
  EXPIRATION_DATE_WRAPPER,
} from '../../core/models/constants/Selectors';
import { Service } from 'typedi';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Styler } from '../../core/shared/styler/Styler';
import { Frame } from '../../core/shared/frame/Frame';
import { LABEL_EXPIRATION_DATE } from '../../core/models/constants/Translations';

@Service()
export class ExpirationDate extends Input {
  static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static DISABLED_ATTRIBUTE = 'disabled';
  private static DISABLED_CLASS = 'st-input--disabled';
  private static EXPIRATION_DATE_LENGTH = 5;
  private static INPUT_PATTERN = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private _currentKeyCode: number;
  private _inputSelectionEnd: number;
  private _inputSelectionStart: number;

  constructor(
    configProvider: ConfigProvider,
    private _formatter: Formatter,
    private messageBus: IMessageBus,
    private frame: Frame
  ) {
    super(
      EXPIRATION_DATE_INPUT,
      EXPIRATION_DATE_MESSAGE,
      EXPIRATION_DATE_LABEL,
      EXPIRATION_DATE_WRAPPER,
      configProvider
    );
    this._init();
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      this.placeholder = config.placeholders.expirydate || '';
      this._inputElement.setAttribute(ExpirationDate.PLACEHOLDER_ATTRIBUTE, this.placeholder);

      const styler: Styler = new Styler(this.getAllowedStyles(), this.frame.parseUrl().styles);

      if (styler.hasSpecificStyle('isLinedUp', config.styles.expirationDate)) {
        styler.addStyles([
          {
            elementSelector: '#st-expiration-date',
            classList: ['st-expiration-date--lined-up'],
          },
          {
            elementSelector: '#st-expiration-date-label',
            classList: ['expiration-date__label--required', 'lined-up'],
          },
        ]);
      }

      if (styler.hasSpecificStyle('outline-input', config.styles.expirationDate)) {
        const outlineValue = config.styles.expirationDate['outline-input'];
        const outlineSize = Number(outlineValue.replace(/\D/g, ''));

        styler.addStyles([
          {
            elementSelector: '#st-expiration-date-wrapper',
            inlineStyles: [
              {
                property: 'padding',
                value: `${outlineSize ? outlineSize : 3}px`,
              },
            ],
          },
        ]);
      }

      if (styler.hasSpecificStyle('color-asterisk', config.styles.expirationDate)) {
        const value = config.styles.expirationDate['color-asterisk'];
        styler.addStyles([
          {
            elementSelector: '#st-expiration-date-label .asterisk',
            inlineStyles: [
              {
                property: 'color',
                value,
              },
            ],
          },
        ]);
      }
    });
  }

  getLabel(): string {
    return LABEL_EXPIRATION_DATE;
  }

  setDisableListener(): void {
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE, (state: FormState) => {
      state !== FormState.AVAILABLE ? this._disableInputField() : this._enableInputField();
    });
  }

  protected format(date: string): void {
    this.setValue(date);
  }

  protected onBlur(): void {
    super.onBlur();
    this._inputElement.value = this._formatter.date(this._inputElement.value, EXPIRATION_DATE_INPUT);
    this._sendState();
  }

  protected onFocus(event: Event): void {
    super.onFocus(event);
    this._inputElement.value = this._formatter.date(this._inputElement.value, EXPIRATION_DATE_INPUT);
  }

  protected onInput(event: Event): void {
    super.onInput(event);
    this._inputElement.value = this.validation.limitLength(
      this._inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this._inputElement.value = this._formatter.date(this._inputElement.value, EXPIRATION_DATE_INPUT);
    this.validation.keepCursorsPosition(this._inputElement);
    this._sendState();
  }

  protected onKeydown(event: KeyboardEvent): KeyboardEvent {
    super.onKeydown(event);
    this._currentKeyCode = event.keyCode;
    this._inputSelectionStart = this._inputElement.selectionStart;
    this._inputSelectionEnd = this._inputElement.selectionEnd;
    return event;
  }

  protected onKeyPress(event: KeyboardEvent): void {
    super.onKeyPress(event);
    this._inputElement.focus();
  }

  protected onPaste(event: ClipboardEvent): void {
    super.onPaste(event);
    this._inputElement.value = this.validation.limitLength(
      this._inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this._inputElement.value = this._formatter.date(this._inputElement.value, EXPIRATION_DATE_INPUT);
    this._sendState();
  }

  private _init(): void {
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

  private _sendState(): void {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE);
    this.messageBus.publish(messageBusEvent);
  }

  private _disableInputField(): void {
    this._inputElement.setAttribute(ExpirationDate.DISABLED_ATTRIBUTE, 'true');
    this._inputElement.classList.add(ExpirationDate.DISABLED_CLASS);
  }

  private _enableInputField(): void {
    this._inputElement.removeAttribute(ExpirationDate.DISABLED_ATTRIBUTE);
    this._inputElement.classList.remove(ExpirationDate.DISABLED_CLASS);
  }
}
