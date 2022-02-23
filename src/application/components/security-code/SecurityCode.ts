import { Service } from 'typedi';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { merge, Observable, pluck } from 'rxjs';
import { iinLookup } from '@trustpayments/ts-iin-lookup';
import { FormState } from '../../core/models/constants/FormState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { LABEL_SECURITY_CODE } from '../../core/models/constants/Translations';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import {
  SECURITY_CODE_INPUT,
  SECURITY_CODE_LABEL,
  SECURITY_CODE_MESSAGE,
  SECURITY_CODE_WRAPPER,
} from '../../core/models/constants/Selectors';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { DefaultPlaceholders } from '../../core/models/constants/config-resolver/DefaultPlaceholders';
import { LONG_CVC, SHORT_CVC, UNKNOWN_CVC } from '../../core/models/constants/SecurityCode';
import { IConfig } from '../../../shared/model/config/IConfig';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Styler } from '../../core/shared/styler/Styler';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../core/models/IStJwtPayload';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { untilDestroy } from '../../../shared/services/message-bus/operators/untilDestroy';
import { EventScope } from '../../core/models/constants/EventScope';
import { ValidationFactory } from '../../core/shared/validation/ValidationFactory';

@Service()
export class SecurityCode extends Input {
  static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(SECURITY_CODE_INPUT) as HTMLInputElement;
  private static BLOCK_CVV_ATTRIBUTE = 'block-cvv';
  private static DISABLED_CLASS = 'st-input--disabled';

  private securityCodeLength: number;
  private autocompleteCardNumberInput: HTMLInputElement = document.querySelector('#st-security-code-input-autocomplete-capture-number');
  private autocompleteExpirationDateInput: HTMLInputElement = document.querySelector('#st-security-code-input-autocomplete-capture-expiration-date');

  constructor(
    configProvider: ConfigProvider,
    private localStorage: BrowserLocalStorage,
    private formatter: Formatter,
    private jwtDecoder: JwtDecoder,
    protected validationFactory: ValidationFactory
  ) {
    super(SECURITY_CODE_INPUT, SECURITY_CODE_MESSAGE, SECURITY_CODE_LABEL, SECURITY_CODE_WRAPPER, configProvider, validationFactory);
    this.validation = this.validationFactory.create();
    this.securityCodeLength = UNKNOWN_CVC;
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      this.placeholder = this.getPlaceholder(this.securityCodeLength);
      this.inputElement.setAttribute(SecurityCode.PLACEHOLDER_ATTRIBUTE, this.placeholder);

      const styler: Styler = new Styler(this.getAllowedStyles(), this.frame.parseUrl().styles);
      if (styler.hasSpecificStyle('isLinedUp', config.styles.securityCode)) {
        styler.addStyles([
          {
            elementSelector: '#st-security-code',
            classList: ['st-security-code--lined-up'],
          },
          {
            elementSelector: '#st-security-code-label',
            classList: ['security-code__label--required', 'lined-up'],
          },
        ]);
      }

      if (styler.hasSpecificStyle('outline-input', config.styles.securityCode)) {
        const outlineValue = config.styles.securityCode['outline-input'];
        const outlineSize = Number(outlineValue.replace(/\D/g, ''));

        styler.addStyles([
          {
            elementSelector: '#st-security-code-wrapper',
            inlineStyles: [
              {
                property: 'padding',
                value: `${outlineSize ? outlineSize : 3}px`,
              },
            ],
          },
        ]);
      }

      if (styler.hasSpecificStyle('color-asterisk', config.styles.securityCode)) {
        const value = config.styles.securityCode['color-asterisk'];
        styler.addStyles([
          {
            elementSelector: '#st-security-code-label .asterisk',
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

    this.securityCodeUpdate$()
      .pipe(filter(Boolean))
      .subscribe((securityCodeLength: number) => {
        this.placeholder = this.getPlaceholder(securityCodeLength);
        this.securityCodeLength = securityCodeLength;
        this.messageBus.publish({
          type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH,
          data: this.securityCodeLength,
        });
      });

    super.setEventListener(MessageBus.EVENTS.FOCUS_SECURITY_CODE, false);
    super.setEventListener(MessageBus.EVENTS.BLUR_SECURITY_CODE);
    this.subscribeSecurityCodeChange();
    this.setDisableListener();
    this.validation.backendValidation(
      this.inputElement,
      this.messageElement,
      MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD
    );

    this.initAutocomplete();
  }

  private getPlaceholder(securityCodeLength: number): string {
    if (!this.configProvider.getConfig()) {
      return this.translator.translate('***');
    }
    if (
      securityCodeLength === UNKNOWN_CVC &&
      this.configProvider.getConfig() &&
      this.configProvider.getConfig().placeholders
    ) {

      return this.configProvider.getConfig().placeholders.securitycode
        ? this.configProvider.getConfig().placeholders.securitycode
        : this.translator.translate('***');
    }
    if (
      this.configProvider.getConfig().placeholders.securitycode &&
      this.configProvider.getConfig().placeholders.securitycode === DefaultPlaceholders.securitycode
    ) {

      return securityCodeLength === LONG_CVC ? this.translator.translate('****') : DefaultPlaceholders.securitycode;
    }

    return this.configProvider.getConfig().placeholders.securitycode;
  }

  private securityCodeUpdate$(): Observable<number> {
    const jwtFromConfig$: Observable<string> = this.configProvider.getConfig$().pipe(map(config => config.jwt));
    const jwtFromUpdate$: Observable<string> = this.messageBus.pipe(
      ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT),
      map(event => event.data.newJwt)
    );

    const cardNumberInput$: Observable<string> = this.messageBus.pipe(
      ofType(MessageBus.EVENTS.CHANGE_CARD_NUMBER),
      map((event: IMessageBusEvent<IFormFieldState>) => event.data.value)
    );

    const cardNumberFromJwt$: Observable<string> = merge(jwtFromConfig$, jwtFromUpdate$).pipe(
      map(jwt => this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.pan)
    );

    const maskedPanFromJsInit$: Observable<string> = this.configProvider
      .getConfig$()
      .pipe(switchMap(() => this.localStorage.select<string>(store => store['app.maskedpan'] as string)));

    return merge(cardNumberInput$, cardNumberFromJwt$, maskedPanFromJsInit$).pipe(
      filter(Boolean),
      map((cardNumber: string) => {
        if (!cardNumber || !iinLookup.lookup(cardNumber).type) {
          return UNKNOWN_CVC;
        }
        if (!iinLookup.lookup(cardNumber).cvcLength[0]) {
          return UNKNOWN_CVC;
        }
        return iinLookup.lookup(cardNumber).cvcLength[0];
      }),
      startWith(UNKNOWN_CVC)
    );
  }

  getLabel(): string {
    return LABEL_SECURITY_CODE;
  }

  protected onBlur(): void {
    super.onBlur();
    this.sendState();
    this.broadcastEvent(false, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onFocus(event: Event): void {
    super.onFocus(event);
    this.sendState();
    this.broadcastEvent(true, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onInput(event: Event): void {
    super.onInput(event);
    this.setInputValue();
    this.validation.keepCursorsPosition(this.inputElement);
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

  private setInputValue(): void {
    this.inputElement.value = this.validation.limitLength(this.inputElement.value, this.getMaxSecurityCodeLength());
    this.inputElement.value = this.formatter.code(
      this.inputElement.value,
      this.getMaxSecurityCodeLength(),
      SECURITY_CODE_INPUT
    );
  }

  private broadcastEvent(data: boolean, eventType: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: eventType,
    };
    this.messageBus.publish(messageBusEvent);
  }

  private sendState(): void {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE);
    this.messageBus.publish(messageBusEvent);
  }

  private setDisableListener(): void {
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.BLOCK_SECURITY_CODE, (state: FormState) => {
      this.toggleSecurityCode(state);
    });
  }

  private setSecurityCodeProperties(length: number, pattern: string): void {
    this.securityCodeLength = length;
    this.setSecurityCodePattern(pattern);
    this.inputElement.value = this.validation.limitLength(this.inputElement.value, this.getMaxSecurityCodeLength());
  }

  private checkSecurityCodeLength(length: number): void {
    switch (length) {
      case LONG_CVC:
        this.setSecurityCodeProperties(length, '^[0-9]{4}$');
        break;
      case SHORT_CVC:
        this.setSecurityCodeProperties(length, '^[0-9]{3}$');
        break;
      default:
        this.setSecurityCodeProperties(UNKNOWN_CVC, '^[0-9]{3,4}$');
    }
  }

  private subscribeSecurityCodeChange(): void {
    this.messageBus
      .pipe(ofType(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH))
      .subscribe((response: IMessageBusEvent<number>) => {
        const { data } = response;
        this.checkSecurityCodeLength(data);
        this.placeholder = this.getPlaceholder(data);
        this.inputElement.setAttribute(SecurityCode.PLACEHOLDER_ATTRIBUTE, this.placeholder);
        this.sendState();
      });

    this.messageBus.subscribeType(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
      if (!data.value) {
        return;
      }

      this.inputElement.removeAttribute(SecurityCode.BLOCK_CVV_ATTRIBUTE);
      this.enableSecurityCode();
      this.inputElement.classList.remove(SecurityCode.DISABLED_CLASS);
    });
  }

  private toggleSecurityCodeValidation(): void {
    this.validation.removeError(this.inputElement, this.messageElement);
    this.inputElement.setCustomValidity('');
  }

  private disableSecurityCode(): void {
    this.inputElement.setAttribute('disabled', 'disabled');
    this.inputElement.classList.add(SecurityCode.DISABLED_CLASS);
  }

  private enableSecurityCode(): void {
    this.inputElement.removeAttribute('disabled');
    this.inputElement.classList.remove(SecurityCode.DISABLED_CLASS);
  }

  private setSecurityCodePattern(securityCodePattern: string): void {
    return this.setAttributes({ pattern: securityCodePattern });
  }

  private shouldDisableSecurityCode(state: FormState): boolean {
    return state !== FormState.AVAILABLE || this.inputElement.hasAttribute(SecurityCode.BLOCK_CVV_ATTRIBUTE);
  }

  private toggleSecurityCode(state: FormState): void {
    if (this.shouldDisableSecurityCode(state)) {
      this.disableSecurityCode();
      this.toggleSecurityCodeValidation();

      return;
    }
    this.enableSecurityCode();
    this.inputElement.classList.remove(SecurityCode.DISABLED_CLASS);
  }

  private getMaxSecurityCodeLength(): number {
    return this.securityCodeLength === UNKNOWN_CVC ? LONG_CVC : this.securityCodeLength;
  }

  private initAutocomplete() {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.AUTOCOMPLETE_SECURITY_CODE),
        pluck('data'),
        filter(value => !this.inputElement.value?.length),
        untilDestroy(this.messageBus)
      )
      .subscribe((expirationDate: string) => {
        this.inputElement.value = expirationDate;
        this.format(this.inputElement.value);
        this.setInputValue();
        this.sendState();
      });

    this.captureAndEmitAutocomplete(this.autocompleteCardNumberInput, PUBLIC_EVENTS.AUTOCOMPLETE_CARD_NUMBER);
    this.captureAndEmitAutocomplete(this.autocompleteExpirationDateInput, PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE);
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
    this.autocompleteExpirationDateInput.value = null;
  }
}
