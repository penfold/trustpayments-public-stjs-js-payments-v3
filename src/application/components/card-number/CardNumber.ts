import { iinLookup } from '@trustpayments/ts-iin-lookup';
import { Service } from 'typedi';
import { filter } from 'rxjs/operators';
import { pluck } from 'rxjs';
import { FormState } from '../../core/models/constants/FormState';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { Utils } from '../../core/shared/utils/Utils';
import { Validation } from '../../core/shared/validation/Validation';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IconFactory } from '../../core/services/icon/IconFactory';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Styler } from '../../core/shared/styler/Styler';
import { LABEL_CARD_NUMBER } from '../../core/models/constants/Translations';
import {
  CARD_NUMBER_INPUT,
  CARD_NUMBER_LABEL,
  CARD_NUMBER_MESSAGE,
  CARD_NUMBER_WRAPPER,
} from '../../core/models/constants/Selectors';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { EventScope } from '../../core/models/constants/EventScope';
import { untilDestroy } from '../../../shared/services/message-bus/operators/untilDestroy';
import { ValidationFactory } from '../../core/shared/validation/ValidationFactory';

@Service()
export class CardNumber extends Input {
  static ifFieldExists = (): HTMLInputElement => document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;

  private static DISABLED_ATTRIBUTE = 'disabled';
  private static DISABLED_CLASS = 'st-input--disabled';
  private static STANDARD_CARD_LENGTH = 19;
  private static WHITESPACES_DECREASE_NUMBER = 2;
  private static getCardNumberForBinProcess = (cardNumber: string) => cardNumber.slice(0, 6);
  private panIcon: boolean;
  private cardNumberFormatted: string;
  private cardNumberLength: number;
  private cardNumberValue: string;
  private isCardNumberValid: boolean;
  private fieldInstance: HTMLInputElement = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
  private autocompleteCaptureExpirationDateInput: HTMLInputElement = document.querySelector('#st-card-number-input-autocomplete-capture-expiration-date');
  private autocompleteCaptureSecurityCodeInput: HTMLInputElement = document.querySelector('#st-card-number-input-autocomplete-capture-security-code');
  private readonly cardNumberField: HTMLInputElement;

  constructor(
    configProvider: ConfigProvider,
    private iconFactory: IconFactory,
    private formatter: Formatter,
    protected validationFactory: ValidationFactory
  ) {
    super(CARD_NUMBER_INPUT, CARD_NUMBER_MESSAGE, CARD_NUMBER_LABEL, CARD_NUMBER_WRAPPER, configProvider, validationFactory);
    this.cardNumberField = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
    this.validation = this.validationFactory.create();
    this.isCardNumberValid = true;
    this.cardNumberLength = CardNumber.STANDARD_CARD_LENGTH;
    this.setFocusListener();
    this.setBlurListener();
    this.setSubmitListener();
    this.setDisableListener();
    this.validation.backendValidation(
      this.inputElement,
      this.messageElement,
      MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD
    );
    this.sendState();
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      this.placeholder = this.translator.translate(config.placeholders.pan) || '';
      this.inputElement.setAttribute(CardNumber.PLACEHOLDER_ATTRIBUTE, this.placeholder);
      this.panIcon = config.panIcon;
      const styler: Styler = new Styler(this.getAllowedStyles(), this.frame.parseUrl().styles);
      if (styler.hasSpecificStyle('isLinedUp', config.styles.cardNumber)) {
        styler.addStyles([
          {
            elementSelector: '#st-card-number',
            classList: ['st-card-number--lined-up'],
          },
          {
            elementSelector: '#st-card-number-label',
            classList: ['card-number__label--required', 'lined-up'],
          },
        ]);
      }

      if (styler.hasSpecificStyle('outline-input', config.styles.cardNumber)) {
        const outlineValue = config.styles.cardNumber['outline-input'];
        const outlineSize = Number(outlineValue.replace(/\D/g, ''));

        styler.addStyles([
          {
            elementSelector: '#st-card-number-wrapper',
            inlineStyles: [
              {
                property: 'padding',
                value: `${outlineSize ? outlineSize : 3}px`,
              },
            ],
          },
        ]);
      }

      if (styler.hasSpecificStyle('color-asterisk', config.styles.cardNumber)) {
        const value = config.styles.cardNumber['color-asterisk'];
        styler.addStyles([
          {
            elementSelector: '#st-card-number-label .asterisk',
            inlineStyles: [
              {
                property: 'color',
                value,
              },
            ],
          },
        ]);
      }

      this.messageBus.pipe(ofType(PUBLIC_EVENTS.UPDATE_JWT), untilDestroy(this.messageBus)).subscribe(() => {
        this.placeholder = this.translator.translate(config.placeholders.pan) || '';
        this.inputElement.setAttribute(CardNumber.PLACEHOLDER_ATTRIBUTE, this.placeholder);
      });
    });

    this.initAutocomplete();
  }

  protected getLabel(): string {
    return LABEL_CARD_NUMBER;
  }

  protected onBlur(): void {
    super.onBlur();
    this.validation.luhnCheck(this.fieldInstance, this.inputElement, this.messageElement);
    this.sendState();
  }

  protected onInput(event: Event): void {
    super.onInput(event);
    this.setInputValue();
    this.sendState();
    this.clearAutocompleteInputs();
  }

  protected onPaste(event: ClipboardEvent): void {
    super.onPaste(event);
    this.setInputValue();
    this.sendState();
  }

  protected onKeyPress(event: KeyboardEvent): void {
    super.onKeyPress(event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    super.onKeydown(event);
    if (Validation.isEnter(event)) {
      this.validation.luhnCheck(this.cardNumberInput, this.inputElement, this.messageElement);
      this.sendState();
    }
  }

  protected setFocusListener(): void {
    super.setEventListener(MessageBus.EVENTS.FOCUS_CARD_NUMBER);
  }

  protected setBlurListener(): void {
    super.setEventListener(MessageBus.EVENTS.BLUR_CARD_NUMBER);
  }

  protected setSubmitListener(): void {
    super.setEventListener(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM);
  }

  private publishSecurityCodeLength(): void {
    const { value } = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: this.getSecurityCodeLength(value),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH,
    };
    this.messageBus.publish(messageBusEvent);
  }

  private getIcon(type: string): HTMLImageElement {
    if (!type || type === 'PIBA') {
      return;
    }
    return this.iconFactory.getIcon(type.toLowerCase());
  }

  private setIconImage(type: string, iconId: string): void {
    const icon: HTMLImageElement = this.getIcon(type);
    const iconInDom: HTMLElement = document.getElementById(iconId);

    if (iconInDom) {
      iconInDom.parentNode.removeChild(iconInDom);
    }
    if (icon) {
      this.setIconInDom(icon);
    }
  }

  private setIconInDom(element: HTMLElement): void {
    const input: HTMLElement = document.getElementById('st-card-number-wrapper');
    input.insertBefore(element, input.childNodes[0]);
  }

  private getBinLookupDetails = (cardNumber: string) => {
    return iinLookup.lookup(cardNumber).type ? iinLookup.lookup(cardNumber) : undefined;
  };

  private getCardFormat = (cardNumber: string) =>
    this.getBinLookupDetails(cardNumber) ? this.getBinLookupDetails(cardNumber).format : undefined;

  private getPossibleCardLength = (cardNumber: string) =>
    this.getBinLookupDetails(cardNumber) ? this.getBinLookupDetails(cardNumber).length : undefined;

  private getSecurityCodeLength = (cardNumber: string) =>
    this.getBinLookupDetails(cardNumber) ? this.getBinLookupDetails(cardNumber).cvcLength[0] : undefined;

  private getMaxLengthOfCardNumber() {
    const cardLengthFromBin = this.getPossibleCardLength(this.inputElement.value);
    this.cardNumberValue = this.inputElement.value.replace(/\s/g, '');
    const cardFormat = this.getCardFormat(this.cardNumberValue);
    let numberOfWhitespaces;
    if (cardFormat) {
      numberOfWhitespaces = cardFormat.split('d').length - CardNumber.WHITESPACES_DECREASE_NUMBER;
    } else {
      numberOfWhitespaces = 0;
    }
    this.cardNumberLength =
      Utils.getLastElementOfArray(cardLengthFromBin) + numberOfWhitespaces || CardNumber.STANDARD_CARD_LENGTH;
    return this.cardNumberLength;
  }

  private getCardNumberFieldState(): IFormFieldState {
    const { validity } = this.getState();
    this.publishSecurityCodeLength();
    return {
      formattedValue: this.cardNumberFormatted,
      validity,
      value: this.cardNumberValue,
    };
  }

  private setInputValue() {
    this.getMaxLengthOfCardNumber();
    this.inputElement.value = this.validation.limitLength(this.inputElement.value, this.cardNumberLength);
    const { formatted, nonformatted } = this.formatter.number(this.inputElement.value, CARD_NUMBER_INPUT);
    this.inputElement.value = formatted;
    this.cardNumberFormatted = formatted;
    this.cardNumberValue = nonformatted;
    this.validation.keepCursorsPosition(this.inputElement);
    const type = this.getBinLookupDetails(this.cardNumberValue)
      ? this.getBinLookupDetails(this.cardNumberValue).type
      : null;
    if (this.panIcon) {
      this.setIconImage(type, 'card-icon');
    }
  }

  private setDisableListener() {
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER, (state: FormState) => {
      if (state !== FormState.AVAILABLE) {
        this.inputElement.setAttribute(CardNumber.DISABLED_ATTRIBUTE, 'true');
        this.inputElement.classList.add(CardNumber.DISABLED_CLASS);
      } else {
        this.inputElement.removeAttribute(CardNumber.DISABLED_ATTRIBUTE);
        this.inputElement.classList.remove(CardNumber.DISABLED_CLASS);
      }
    });
  }

  private sendState() {
    const { value, validity } = this.getCardNumberFieldState();
    const messageBusEvent: IMessageBusEvent = {
      data: this.getCardNumberFieldState(),
      type: MessageBus.EVENTS.CHANGE_CARD_NUMBER,
    };
    if (validity) {
      const binProcessEvent: IMessageBusEvent = {
        data: CardNumber.getCardNumberForBinProcess(value),
        type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS,
      };
      this.messageBus.publish(binProcessEvent, EventScope.ALL_FRAMES);
    }
    this.messageBus.publish(messageBusEvent);
  }

  private initAutocomplete() {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.AUTOCOMPLETE_CARD_NUMBER),
        pluck('data'),
        filter(value => !this.inputElement.value?.length),
        untilDestroy<string>(this.messageBus)
      )
      .subscribe((cardNumber: string) => {
        this.inputElement.value = cardNumber;
        this.format(this.inputElement.value);
        this.setInputValue();
        this.sendState();
        this.clearAutocompleteInputs();
      });

    this.captureAndEmitAutocomplete(this.autocompleteCaptureExpirationDateInput, PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE);
    this.captureAndEmitAutocomplete(this.autocompleteCaptureSecurityCodeInput, PUBLIC_EVENTS.AUTOCOMPLETE_SECURITY_CODE);
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
    this.autocompleteCaptureExpirationDateInput.value = null;
    this.autocompleteCaptureSecurityCodeInput.value = null;
  }
}
