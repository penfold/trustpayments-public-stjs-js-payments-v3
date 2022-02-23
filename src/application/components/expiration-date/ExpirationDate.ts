import { Service } from 'typedi';
import { pluck } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormState } from '../../core/models/constants/FormState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import {
  EXPIRATION_DATE_INPUT,
  EXPIRATION_DATE_LABEL,
  EXPIRATION_DATE_MESSAGE,
  EXPIRATION_DATE_WRAPPER,
} from '../../core/models/constants/Selectors';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Styler } from '../../core/shared/styler/Styler';
import { LABEL_EXPIRATION_DATE } from '../../core/models/constants/Translations';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { untilDestroy } from '../../../shared/services/message-bus/operators/untilDestroy';
import { EventScope } from '../../core/models/constants/EventScope';
import { ValidationFactory } from '../../core/shared/validation/ValidationFactory';

@Service()
export class ExpirationDate extends Input {
  static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static DISABLED_ATTRIBUTE = 'disabled';
  private static DISABLED_CLASS = 'st-input--disabled';
  private static EXPIRATION_DATE_LENGTH = 5;
  private static INPUT_PATTERN = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private currentKeyCode: number;
  private autocompleteCardNumberInput: HTMLInputElement = document.querySelector('#st-expiration-date-input-autocomplete-capture-number');
  private autocompleteSecurityCodeInput: HTMLInputElement = document.querySelector('#st-expiration-date-input-autocomplete-capture-security-code');

  constructor(
    configProvider: ConfigProvider,
    private formatter: Formatter,
    protected validationFactory: ValidationFactory
  ) {
    super(
      EXPIRATION_DATE_INPUT,
      EXPIRATION_DATE_MESSAGE,
      EXPIRATION_DATE_LABEL,
      EXPIRATION_DATE_WRAPPER,
      configProvider,
      validationFactory
    );
    super.setEventListener(MessageBus.EVENTS.BLUR_EXPIRATION_DATE);
    super.setEventListener(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE);
    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });
    this.setDisableListener();
    this.validation = this.validationFactory.create();
    this.validation.backendValidation(
      this.inputElement,
      this.messageElement,
      MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
    );
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      this.placeholder = this.translator.translate(config.placeholders.expirydate) || '';
      this.inputElement.setAttribute(ExpirationDate.PLACEHOLDER_ATTRIBUTE, this.placeholder);

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

    this.initAutocomplete();
  }

  getLabel(): string {
    return LABEL_EXPIRATION_DATE;
  }

  setDisableListener(): void {
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE, (state: FormState) => {
      state !== FormState.AVAILABLE ? this.disableInputField() : this.enableInputField();
    });
  }

  protected format(date: string): void {
    this.setValue(date);
  }

  protected onBlur(): void {
    super.onBlur();
    this.inputElement.value = this.formatter.date(this.inputElement.value, EXPIRATION_DATE_INPUT);
    this.sendState();
  }

  protected onFocus(event: Event): void {
    super.onFocus(event);
    this.inputElement.value = this.formatter.date(this.inputElement.value, EXPIRATION_DATE_INPUT);
  }

  protected onInput(event: Event): void {
    super.onInput(event);
    this.formatAutocompleteValue();
    this.inputElement.value = this.validation.limitLength(
      this.inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this.inputElement.value = this.formatter.date(this.inputElement.value, EXPIRATION_DATE_INPUT);
    this.validation.keepCursorsPosition(this.inputElement);
    this.sendState();
    this.clearAutocompleteInputs();
  }

  protected onKeydown(event: KeyboardEvent): KeyboardEvent {
    super.onKeydown(event);
    this.currentKeyCode = event.keyCode;
    return event;
  }

  protected onKeyPress(event: KeyboardEvent): void {
    super.onKeyPress(event);
    this.inputElement.focus();
  }

  protected onPaste(event: ClipboardEvent): void {
    super.onPaste(event);
    this.inputElement.value = this.validation.limitLength(
      this.inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this.inputElement.value = this.formatter.date(this.inputElement.value, EXPIRATION_DATE_INPUT);
    this.sendState();
  }

  private sendState(): void {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE);
    this.messageBus.publish(messageBusEvent);
  }

  private disableInputField(): void {
    this.inputElement.setAttribute(ExpirationDate.DISABLED_ATTRIBUTE, 'true');
    this.inputElement.classList.add(ExpirationDate.DISABLED_CLASS);
  }

  private enableInputField(): void {
    this.inputElement.removeAttribute(ExpirationDate.DISABLED_ATTRIBUTE);
    this.inputElement.classList.remove(ExpirationDate.DISABLED_CLASS);
  }

  private initAutocomplete() {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE),
        pluck('data'),
        filter(value => !this.inputElement.value?.length),
        untilDestroy(this.messageBus)
      )
      .subscribe((expirationDate: string) => {
        this.inputElement.value = expirationDate;
        this.formatAutocompleteValue();
        this.format(this.inputElement.value);
        this.sendState();
      });

    this.captureAndEmitAutocomplete(this.autocompleteCardNumberInput, PUBLIC_EVENTS.AUTOCOMPLETE_CARD_NUMBER);
    this.captureAndEmitAutocomplete(this.autocompleteSecurityCodeInput, PUBLIC_EVENTS.AUTOCOMPLETE_SECURITY_CODE);
  }

  private captureAndEmitAutocomplete(input: HTMLInputElement, messageType: string) {
    input.addEventListener('input', (event: Event) => {
      const value = (event.target as HTMLInputElement).value;

      this.messageBus.publish({
        type: messageType,
        data: value,
      }, EventScope.ALL_FRAMES);
    });
  }

  private clearAutocompleteInputs() {
    this.autocompleteCardNumberInput.value = null;
    this.autocompleteSecurityCodeInput.value = null;
  }

  private formatAutocompleteValue() {
    this.inputElement.value = /\d{2}\/\d{4}/.test(this.inputElement.value) ? this.inputElement.value.replace(/\/\d{2}/, '/') : this.inputElement.value;
  }
}
