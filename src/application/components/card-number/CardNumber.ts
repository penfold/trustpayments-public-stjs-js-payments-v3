import { FormState } from '../../core/models/constants/FormState';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { Utils } from '../../core/shared/utils/Utils';
import { Validation } from '../../core/shared/validation/Validation';
import { iinLookup } from '@trustpayments/ts-iin-lookup';
import { Service } from 'typedi';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IconFactory } from '../../core/services/icon/IconFactory';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Styler } from '../../core/shared/styler/Styler';
import { Frame } from '../../core/shared/frame/Frame';
import { LABEL_CARD_NUMBER } from '../../core/models/constants/Translations';
import {
  CARD_NUMBER_INPUT,
  CARD_NUMBER_LABEL,
  CARD_NUMBER_MESSAGE,
  CARD_NUMBER_WRAPPER,
} from '../../core/models/constants/Selectors';
import { ITranslator } from '../../core/shared/translator/ITranslator';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { takeUntil } from 'rxjs/operators';

@Service()
export class CardNumber extends Input {
  static ifFieldExists = (): HTMLInputElement => document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;

  private static DISABLED_ATTRIBUTE = 'disabled';
  private static DISABLED_CLASS = 'st-input--disabled';
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static STANDARD_CARD_LENGTH = 19;
  private static WHITESPACES_DECREASE_NUMBER = 2;

  private static _getCardNumberForBinProcess = (cardNumber: string) => cardNumber.slice(0, 6);

  validation: Validation;
  private _panIcon: boolean;
  private _cardNumberFormatted: string;
  private _cardNumberLength: number;
  private _cardNumberValue: string;
  private _isCardNumberValid: boolean;
  private _fieldInstance: HTMLInputElement = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
  private readonly _cardNumberField: HTMLInputElement;

  constructor(
    configProvider: ConfigProvider,
    private _iconFactory: IconFactory,
    private _formatter: Formatter,
    private frame: Frame,
    private messageBus: IMessageBus,
    private translator: ITranslator
  ) {
    super(CARD_NUMBER_INPUT, CARD_NUMBER_MESSAGE, CARD_NUMBER_LABEL, CARD_NUMBER_WRAPPER, configProvider);
    this._cardNumberField = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
    this.validation = new Validation();
    this._isCardNumberValid = true;
    this._cardNumberLength = CardNumber.STANDARD_CARD_LENGTH;
    this.setFocusListener();
    this.setBlurListener();
    this.setSubmitListener();
    this._setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD
    );
    this._sendState();
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      this.placeholder = this.translator.translate(config.placeholders.pan) || '';
      this._inputElement.setAttribute(CardNumber.PLACEHOLDER_ATTRIBUTE, this.placeholder);
      this._panIcon = config.panIcon;
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

      const destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
      this.messageBus.pipe(ofType(PUBLIC_EVENTS.UPDATE_JWT), takeUntil(destroy$)).subscribe(() => {
        this.placeholder = this.translator.translate(config.placeholders.pan) || '';
        this._inputElement.setAttribute(CardNumber.PLACEHOLDER_ATTRIBUTE, this.placeholder);
      });
    });
  }

  protected getLabel(): string {
    return LABEL_CARD_NUMBER;
  }

  protected onBlur(): void {
    super.onBlur();
    this.validation.luhnCheck(this._fieldInstance, this._inputElement, this._messageElement);
    this._sendState();
  }

  protected onFocus(event: Event): void {
    super.onFocus(event);
    this._disableSecurityCodeField(this._inputElement.value);
  }

  protected onInput(event: Event): void {
    super.onInput(event);
    this._setInputValue();
    this._sendState();
  }

  protected onPaste(event: ClipboardEvent): void {
    super.onPaste(event);
    this._setInputValue();
    this._sendState();
  }

  protected onKeyPress(event: KeyboardEvent): void {
    super.onKeyPress(event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    super.onKeydown(event);
    if (Validation.isEnter(event)) {
      this.validation.luhnCheck(this._cardNumberInput, this._inputElement, this._messageElement);
      this._sendState();
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

  private _publishSecurityCodeLength(): void {
    const { value } = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: this._getSecurityCodeLength(value),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH,
    };
    this.messageBus.publish(messageBusEvent);
  }

  private _getIcon(type: string): HTMLImageElement {
    if (!type) {
      return;
    }
    return this._iconFactory.getIcon(type.toLowerCase());
  }

  private _setIconImage(type: string, iconId: string): void {
    const icon: HTMLImageElement = this._getIcon(type);
    const iconInDom: HTMLElement = document.getElementById(iconId);

    if (iconInDom) {
      iconInDom.parentNode.removeChild(iconInDom);
    }
    if (icon) {
      this._setIconInDom(icon);
    }
  }

  private _setIconInDom(element: HTMLElement): void {
    const input: HTMLElement = document.getElementById('st-card-number-wrapper');
    input.insertBefore(element, input.childNodes[0]);
  }

  private _getBinLookupDetails = (cardNumber: string) => {
    return iinLookup.lookup(cardNumber).type ? iinLookup.lookup(cardNumber) : undefined;
  };

  private _getCardFormat = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).format : undefined;

  private _getPossibleCardLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).length : undefined;

  private _getSecurityCodeLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).cvcLength[0] : undefined;

  private _getMaxLengthOfCardNumber() {
    const cardLengthFromBin = this._getPossibleCardLength(this._inputElement.value);
    this._cardNumberValue = this._inputElement.value.replace(/\s/g, '');
    const cardFormat = this._getCardFormat(this._cardNumberValue);
    let numberOfWhitespaces;
    if (cardFormat) {
      numberOfWhitespaces = cardFormat.split('d').length - CardNumber.WHITESPACES_DECREASE_NUMBER;
    } else {
      numberOfWhitespaces = 0;
    }
    this._cardNumberLength =
      Utils.getLastElementOfArray(cardLengthFromBin) + numberOfWhitespaces || CardNumber.STANDARD_CARD_LENGTH;
    return this._cardNumberLength;
  }

  private _getCardNumberFieldState(): IFormFieldState {
    const { validity } = this.getState();
    this._publishSecurityCodeLength();
    return {
      formattedValue: this._cardNumberFormatted,
      validity,
      value: this._cardNumberValue,
    };
  }

  private _setInputValue() {
    this._getMaxLengthOfCardNumber();
    this._disableSecurityCodeField(this._inputElement.value);
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._cardNumberLength);
    const { formatted, nonformatted } = this._formatter.number(this._inputElement.value, CARD_NUMBER_INPUT);
    this._inputElement.value = formatted;
    this._cardNumberFormatted = formatted;
    this._cardNumberValue = nonformatted;
    this.validation.keepCursorsPosition(this._inputElement);
    const type = this._getBinLookupDetails(this._cardNumberValue)
      ? this._getBinLookupDetails(this._cardNumberValue).type
      : null;
    if (this._panIcon) {
      this._setIconImage(type, 'card-icon');
    }
  }

  private _setDisableListener() {
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER, (state: FormState) => {
      if (state !== FormState.AVAILABLE) {
        this._inputElement.setAttribute(CardNumber.DISABLED_ATTRIBUTE, 'true');
        this._inputElement.classList.add(CardNumber.DISABLED_CLASS);
      } else {
        this._inputElement.removeAttribute(CardNumber.DISABLED_ATTRIBUTE);
        this._inputElement.classList.remove(CardNumber.DISABLED_CLASS);
      }
    });
  }

  private _disableSecurityCodeField(cardNumber: string) {
    const number: string = Validation.clearNonDigitsChars(cardNumber);
    const isCardPiba: boolean = CardNumber.NO_CVV_CARDS.includes(iinLookup.lookup(number).type);
    const formState = isCardPiba ? FormState.BLOCKED : FormState.AVAILABLE;
    const messageBusEventPiba: IMessageBusEvent = {
      data: { formState, isCardPiba },
      type: MessageBus.EVENTS.IS_CARD_WITHOUT_CVV,
    };
    this.messageBus.publish(messageBusEventPiba);
  }

  private _sendState() {
    const { value, validity } = this._getCardNumberFieldState();
    const messageBusEvent: IMessageBusEvent = {
      data: this._getCardNumberFieldState(),
      type: MessageBus.EVENTS.CHANGE_CARD_NUMBER,
    };
    if (validity) {
      const binProcessEvent: IMessageBusEvent = {
        data: CardNumber._getCardNumberForBinProcess(value),
        type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS,
      };
      this.messageBus.publish(binProcessEvent, true);
    }
    this.messageBus.publish(messageBusEvent);
  }
}
