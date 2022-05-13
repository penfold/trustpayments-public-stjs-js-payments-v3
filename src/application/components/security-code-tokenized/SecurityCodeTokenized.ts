import { Service } from 'typedi';
import { FormState } from '../../core/models/constants/FormState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { LABEL_TOKENIZED_SECURITY_CODE } from '../../core/models/constants/Translations';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { Validation } from '../../core/shared/validation/Validation';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Styler } from '../../core/shared/styler/Styler';
import { IStyle } from '../../../shared/model/config/IStyle';
import {
  TOKENIZED_SECURITY_CODE_DISABLED_CLASS,
  TOKENIZED_SECURITY_CODE_INPUT_ID,
  TOKENIZED_SECURITY_CODE_INPUT_SELECTOR,
  TOKENIZED_SECURITY_CODE_LABEL,
  TOKENIZED_SECURITY_CODE_LENGTH,
  TOKENIZED_SECURITY_CODE_MESSAGE,
  TOKENIZED_SECURITY_CODE_PATTERN,
  TOKENIZED_SECURITY_CODE_WRAPPER,
} from '../../core/models/constants/SecurityCodeTokenized';
import { TokenizedCardPaymentConfigName } from '../../../integrations/tokenized-card/models/ITokenizedCardPaymentMethod';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';

@Service()
export class SecurityCodeTokenized extends Input {
  constructor(
    configProvider: ConfigProvider,
    private formatter: Formatter,
    protected validation: Validation
  ) {
    super(
      TOKENIZED_SECURITY_CODE_INPUT_ID,
      TOKENIZED_SECURITY_CODE_MESSAGE,
      TOKENIZED_SECURITY_CODE_LABEL,
      TOKENIZED_SECURITY_CODE_WRAPPER,
      configProvider,
      validation);

    this.resetInputListener();
    this.setDisableListener();
    this.initInputStyle();

    this.messageBus.subscribeType(MessageBus.EVENTS.VALIDATE_TOKENIZED_SECURITY_CODE, () => {
      this.validation.validate(this.inputElement, this.messageElement);
    });

    this.validation.backendValidation(
      this.inputElement,
      this.messageElement,
      PUBLIC_EVENTS.TOKENIZED_CARD_PAYMENT_METHOD_FAILED
    );
  }

  getLabel(): string {
    return LABEL_TOKENIZED_SECURITY_CODE;
  }

  protected onBlur(): void {
    super.onBlur();
    this.sendState();
  }

  protected onFocus(event: Event): void {
    super.onFocus(event);
    this.sendState();
  }

  protected onInput(event: Event): void {
    super.onInput(event);
    this.setInputValue();
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent): void {
    super.onPaste(event);
    this.setInputValue();
    this.sendState();
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if(Validation.isEnter(event)) {
      event.preventDefault();
      this.validation.validate(this.inputElement, this.messageElement);
      this.sendState();
      this.messageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_CARD_START_PAYMENT_METHOD });
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    super.onKeydown(event);
    if(Validation.isEnter(event)) {
      this.validation.validate(this.inputElement, this.messageElement);
      this.sendState();
    }
  }

  private resetInputListener() {
    this.messageBus.subscribeType(PUBLIC_EVENTS.TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT, () => {
      this.resetInput();
    });
  }

  private initInputStyle() {
    this.configProvider.getConfig$(true).subscribe((config: IConfig) => {
      const inputStyle: IStyle = config[TokenizedCardPaymentConfigName]?.style || config?.styles?.securityCode;
      this.setAttributes({
        pattern: TOKENIZED_SECURITY_CODE_PATTERN,
        placeholder: config[TokenizedCardPaymentConfigName]?.placeholder,
      });

      const arrayOfStyles: IStyle[] = this.objectToArrayOfObjects({ ...config?.styles?.defaultStyles, ...inputStyle });
      const styler: Styler = new Styler(this.getAllowedStyles(), arrayOfStyles);

      if(styler.hasSpecificStyle('isLinedUp', inputStyle)) {
        styler.addStyles([
          {
            elementSelector: `#${TOKENIZED_SECURITY_CODE_INPUT_SELECTOR}`,
            classList: ['st-security-code--lined-up'],
          },
          {
            elementSelector: `#${TOKENIZED_SECURITY_CODE_LABEL}`,
            classList: ['security-code__label--required', 'lined-up'],
          },
        ]);
      }

      if(styler.hasSpecificStyle('outline-input', inputStyle)) {
        const outlineValue = inputStyle['outline-input'];
        const outlineSize = Number(String(outlineValue).replace(/\D/g, ''));

        styler.addStyles([
          {
            elementSelector: `#${TOKENIZED_SECURITY_CODE_WRAPPER}`,
            inlineStyles: [
              {
                property: 'padding',
                value: `${outlineSize ? outlineSize : 3}px`,
              },
            ],
          },
        ]);
      }

      if(styler.hasSpecificStyle('color-asterisk', inputStyle)) {
        const value = inputStyle['color-asterisk'];
        styler.addStyles([
          {
            elementSelector: `#${TOKENIZED_SECURITY_CODE_LABEL} .asterisk`,
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

  private setInputValue(): void {
    this.inputElement.value = this.validation.limitLength(this.inputElement.value, TOKENIZED_SECURITY_CODE_LENGTH);
    this.inputElement.value = this.formatter.code(
      this.inputElement.value,
      TOKENIZED_SECURITY_CODE_LENGTH,
      TOKENIZED_SECURITY_CODE_INPUT_ID
    );
  }

  private sendState(): void {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_TOKENIZED_SECURITY_CODE);
    this.messageBus.publish(messageBusEvent);
  }

  private setDisableListener(): void {
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.BLOCK_FORM, (state: FormState) => {
      this.toggleSecurityCode(state);
    });
  }

  private resetInput(): void {
    this.inputElement.value = null;
    this.validation.removeError(this.inputElement, this.messageElement);
    Validation.resetValidationProperties(this.inputElement);
  }

  private disableInput(): void {
    this.inputElement.setAttribute('disabled', 'disabled');
    this.inputElement.classList.add(TOKENIZED_SECURITY_CODE_DISABLED_CLASS);
  }

  private enableSecurityCode(): void {
    this.inputElement.removeAttribute('disabled');
    this.inputElement.classList.remove(TOKENIZED_SECURITY_CODE_DISABLED_CLASS);
  }

  private toggleSecurityCode(state: FormState): void {
    if(state !== FormState.AVAILABLE) {
      this.disableInput();

      return;
    }
    this.enableSecurityCode();
  }

  private objectToArrayOfObjects(object: Record<string, string>): Array<Record<string, string>> {
   return  Object.entries(object).reduce((objectList, arrayOfStrings) => ([...objectList, { [arrayOfStrings[0]]: arrayOfStrings[1] }]), []);
}

}
