import { FormState } from '../../application/core/models/constants/FormState';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { IStyles } from '../../shared/model/config/IStyles';
import { IValidationMessageBus } from '../../application/core/models/IValidationMessageBus';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import {
  ANIMATED_CARD_COMPONENT_IFRAME,
  ANIMATED_CARD_COMPONENT_NAME,
  CARD_NUMBER_COMPONENT_NAME,
  CARD_NUMBER_IFRAME,
  EXPIRATION_DATE_COMPONENT_NAME,
  EXPIRATION_DATE_IFRAME,
  SECURITY_CODE_COMPONENT_NAME,
  SECURITY_CODE_IFRAME,
} from '../../application/core/models/constants/Selectors';
import { Validation } from '../../application/core/shared/validation/Validation';
import { iinLookup } from '@trustpayments/ts-iin-lookup';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { Observable } from 'rxjs';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../shared/model/config/IConfig';
import { PRIVATE_EVENTS, PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { first, map, takeUntil } from 'rxjs/operators';
import { Frame } from '../../application/core/shared/frame/Frame';
import { PAY, PROCESSING } from '../../application/core/models/constants/Translations';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import Container from 'typedi';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { TranslatorToken } from '../../shared/dependency-injection/InjectionTokens';

export class CardFrames {
  private static CARD_NUMBER_FIELD_NAME: string = 'pan';
  private static CLICK_EVENT: string = 'click';
  private static COMPLETE_FORM_NUMBER_OF_FIELDS: number = 3;
  private static EXPIRY_DATE_FIELD_NAME: string = 'expirydate';
  private static INPUT_EVENT: string = 'input';
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static ONLY_CVV_NUMBER_OF_FIELDS: number = 1;
  private static SUBMIT_EVENT: string = 'submit';
  private static SECURITY_CODE_FIELD_NAME: string = 'securitycode';
  private static SUBMIT_BUTTON_AS_BUTTON_MARKUP: string = 'button[type="submit"]';
  private static SUBMIT_BUTTON_AS_INPUT_MARKUP: string = 'input[type="submit"]';
  private static SUBMIT_BUTTON_DISABLED_CLASS: string = 'st-button-submit__disabled';

  private _animatedCard: HTMLIFrameElement;
  private _cardNumber: HTMLIFrameElement;
  private _expirationDate: HTMLIFrameElement;
  private _securityCode: HTMLIFrameElement;
  private _validation: Validation;
  private _translator: ITranslator;
  private _messageBusEvent: IMessageBusEvent = { data: { message: '' }, type: '' };
  private _submitButton: HTMLInputElement | HTMLButtonElement;
  private _buttonId: string;
  private _defaultPaymentType: string;
  private _paymentTypes: string[];
  private _payMessage: string;
  private _processingMessage: string;
  private _fieldsToSubmitLength: number;
  private _isCardWithNoCvv: boolean;
  private _noFieldConfiguration: boolean;
  private _onlyCvvConfiguration: boolean;
  private _configurationForStandardCard: boolean;
  private _loadAnimatedCard: boolean;
  private _config$: Observable<IConfig>;
  protected styles: IStyles;
  protected params: any;
  protected elementsToRegister: HTMLElement[];
  protected elementsTargets: string[];
  protected jwt: string;
  protected origin: string;
  protected componentIds: any;
  protected submitCallback: any;
  protected fieldsToSubmit: string[];
  protected messageBus: IMessageBus;
  protected formId: string;
  private destroy$: Observable<void>;

  constructor(
    jwt: string,
    origin: string,
    componentIds: Record<string, any>,
    styles: IStyles,
    paymentTypes: string[],
    defaultPaymentType: string,
    animatedCard: boolean,
    buttonId: string,
    fieldsToSubmit: string[],
    formId: string,
    private _configProvider: ConfigProvider,
    private _iframeFactory: IframeFactory,
    private _frame: Frame,
    private _messageBus: IMessageBus,
    private jwtDecoder: JwtDecoder
  ) {
    this.fieldsToSubmit = fieldsToSubmit || ['pan', 'expirydate', 'securitycode'];
    this.elementsToRegister = [];
    this.componentIds = componentIds;
    this.formId = formId;
    this.jwt = jwt;
    this.origin = origin;
    this.styles = this._getStyles(styles);
    this._translator = Container.get(TranslatorToken);
    this.params = { locale: this.jwtDecoder.decode(jwt).payload.locale || 'en_GB', origin: this.origin };
    this._config$ = this._configProvider.getConfig$();
    this._setInitValues(buttonId, defaultPaymentType, paymentTypes, animatedCard, jwt, formId);
    this.configureFormFieldsAmount(jwt);
    this.styles = this._getStyles(styles);
    this.destroy$ = this._messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  public init() {
    this._preventFormSubmit();
    this._createSubmitButton();
    this._initSubscribes();
    this._initCardFrames();
    this.elementsTargets = this.setElementsFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  private _getStyles(styles: any) {
    for (const key in styles) {
      if (styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles };
    return styles;
  }

  protected configureFormFieldsAmount(jwt: string): void {
    this._fieldsToSubmitLength = this.fieldsToSubmit.length;
    this._isCardWithNoCvv = jwt && CardFrames.NO_CVV_CARDS.includes(this._getCardType(jwt));
    this._noFieldConfiguration =
      this._fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this._onlyCvvConfiguration =
      this._fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      !this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this._configurationForStandardCard =
      this._fieldsToSubmitLength === CardFrames.COMPLETE_FORM_NUMBER_OF_FIELDS &&
      this._loadAnimatedCard &&
      !this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.CARD_NUMBER_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.EXPIRY_DATE_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
  }

  protected registerElements(fields: HTMLElement[], targets: string[]): void {
    if (fields.length === targets.length) {
      targets.forEach((item, index) => {
        const element: HTMLElement = document.getElementById(item);
        if (element !== null) {
          element.appendChild(fields[index]);
        }
      });

      this.destroy$.pipe(first()).subscribe(() => {
        targets.forEach((item, index) => {
          const element: HTMLElement = document.getElementById(item);
          const iframe: HTMLElement = fields[index];
          if (element && iframe && iframe.parentElement === element) {
            element.removeChild(iframe);
          }
        });
      });
    }
  }

  protected setElementsFields(): string[] {
    if (this._configurationForStandardCard) {
      return [
        this.componentIds.cardNumber,
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
        this.componentIds.animatedCard,
      ];
    } else if (this._onlyCvvConfiguration) {
      return [this.componentIds.securityCode];
    } else if (this._noFieldConfiguration) {
      return [];
    } else {
      return [
        this.componentIds.cardNumber, //
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
      ];
    }
  }

  private _createSubmitButton = (): HTMLInputElement | HTMLButtonElement => {
    const form = document.getElementById(this.formId);

    this._submitButton =
      (document.getElementById(this._buttonId) as HTMLInputElement | HTMLButtonElement) ||
      form.querySelector(CardFrames.SUBMIT_BUTTON_AS_BUTTON_MARKUP) ||
      form.querySelector(CardFrames.SUBMIT_BUTTON_AS_INPUT_MARKUP);
    this._disableSubmitButton(FormState.LOADING);

    this._config$.subscribe(response => {
      const { components } = response;

      if (this._submitButton) {
        this._submitButton.textContent = this._payMessage;
      }

      if (components.startOnLoad) {
        this._disableSubmitButton(FormState.AVAILABLE);
      }
    });

    return this._submitButton;
  };

  private _disableFormField(state: FormState, eventName: string, target: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: eventName,
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _disableSubmitButton(state: FormState): void {
    if (this._submitButton) {
      this._setSubmitButtonProperties(this._submitButton, state);
    }
  }

  private _getCardType(jwt: string): string {
    const cardDetails = this.jwtDecoder.decode(jwt) as any;
    if (cardDetails.payload.pan) {
      return iinLookup.lookup(cardDetails.payload.pan).type;
    }
  }

  private _initCardNumberFrame(styles: Record<string, string>): void {
    this._cardNumber = this._iframeFactory.create(CARD_NUMBER_COMPONENT_NAME, CARD_NUMBER_IFRAME, styles, this.params);
    this.elementsToRegister.push(this._cardNumber);
  }

  private _initExpiryDateFrame(styles: Record<string, string>): void {
    this._expirationDate = this._iframeFactory.create(
      EXPIRATION_DATE_COMPONENT_NAME,
      EXPIRATION_DATE_IFRAME,
      styles,
      this.params
    );
    this.elementsToRegister.push(this._expirationDate);
  }

  private _initSecurityCodeFrame(styles: Record<string, string>): void {
    this._securityCode = this._iframeFactory.create(
      SECURITY_CODE_COMPONENT_NAME,
      SECURITY_CODE_IFRAME,
      styles,
      this.params
    );
    this.elementsToRegister.push(this._securityCode);
  }

  private _initAnimatedCardFrame(): void {
    const animatedCardConfig = { ...this.params };
    if (this._paymentTypes !== undefined) {
      animatedCardConfig.paymentTypes = this._paymentTypes;
    }
    if (this._defaultPaymentType !== undefined) {
      animatedCardConfig.defaultPaymentType = this._defaultPaymentType;
    }
    this._animatedCard = this._iframeFactory.create(
      ANIMATED_CARD_COMPONENT_NAME,
      ANIMATED_CARD_COMPONENT_IFRAME,
      {},
      animatedCardConfig,
      -1
    );
    this.elementsToRegister.push(this._animatedCard);
  }

  private _initCardFrames(): void {
    const { defaultStyles } = this.styles;
    let { cardNumber, securityCode, expirationDate } = this.styles;
    cardNumber = Object.assign({}, defaultStyles, cardNumber);
    securityCode = Object.assign({}, defaultStyles, securityCode);
    expirationDate = Object.assign({}, defaultStyles, expirationDate);
    if (this._onlyCvvConfiguration) {
      this._initSecurityCodeFrame(securityCode);
    } else if (this._configurationForStandardCard) {
      this._initCardNumberFrame(cardNumber);
      this._initExpiryDateFrame(expirationDate);
      this._initSecurityCodeFrame(securityCode);
      this._initAnimatedCardFrame();
    } else {
      this._initCardNumberFrame(cardNumber);
      this._initExpiryDateFrame(expirationDate);
      this._initSecurityCodeFrame(securityCode);
    }
  }

  private _initSubscribes(): void {
    this._submitFormListener();
    this._subscribeBlockSubmit();
    this._validateFieldsAfterSubmit();
    this._setMerchantInputListeners();
  }

  private _onInput(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: DomMethods.parseForm(this.formId),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS,
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _publishSubmitEvent(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: {
        fieldsToSubmit: this.fieldsToSubmit,
      },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM,
    };
    this._messageBus.publish(messageBusEvent, true);
  }

  private _publishValidatedFieldState(field: { message: string; state: boolean }, eventType: string): void {
    this._messageBusEvent.type = eventType;
    this._messageBusEvent.data.message = field.message;
    this._messageBus.publish(this._messageBusEvent);
  }

  private _setMerchantInputListeners(): void {
    const els = DomMethods.getAllFormElements(document.getElementById(this.formId));
    for (const el of els) {
      el.addEventListener(CardFrames.INPUT_EVENT, this._onInput.bind(this));
    }
  }

  private _setInitValues(
    buttonId: string,
    defaultPaymentType: string,
    paymentTypes: any,
    loadAnimatedCard: boolean,
    jwt: string,
    formId: string
  ): void {
    this._validation = new Validation();
    this._buttonId = buttonId;
    this.formId = formId;
    this._defaultPaymentType = defaultPaymentType;
    this._paymentTypes = paymentTypes;
    this.jwt = jwt;
    this._payMessage = this._translator.translate(PAY);
    this._processingMessage = `${this._translator.translate(PROCESSING)} ...`;
    this._loadAnimatedCard = loadAnimatedCard !== undefined ? loadAnimatedCard : true;

    this._messageBus
      .pipe(ofType(PUBLIC_EVENTS.LOCALE_CHANGED), takeUntil(this._messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY))))
      .subscribe(event => {
        this._payMessage = this._translator.translate(PAY);
        this._processingMessage = `${this._translator.translate(PROCESSING)} ...`;
        this._submitButton.textContent = this._submitButton.disabled ? this._processingMessage : this._payMessage;
      });
  }

  private _setSubmitButtonProperties(element: any, state: FormState): HTMLElement {
    let disabledState;
    if (state === FormState.BLOCKED) {
      element.textContent = this._processingMessage;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
      disabledState = true;
    } else if (state === FormState.COMPLETE) {
      element.textContent = this._payMessage;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS); // Keep it locked but return it to original text
      disabledState = true;
    } else if (state === FormState.LOADING) {
      element.textContent = this._payMessage;
      disabledState = true;
    } else {
      element.textContent = this._payMessage;
      element.classList.remove(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
      disabledState = false;
    }
    element.disabled = disabledState;
    return element;
  }

  private _submitFormListener(): void {
    if (this._submitButton) {
      const clickHandler = () => this._publishSubmitEvent();
      this._submitButton.addEventListener(CardFrames.CLICK_EVENT, clickHandler);

      this.destroy$.pipe(first()).subscribe(() => {
        this._submitButton.removeEventListener(CardFrames.CLICK_EVENT, clickHandler);
      });
    }

    this._messageBus
      .pipe(ofType(PUBLIC_EVENTS.CALL_SUBMIT_EVENT), takeUntil(this.destroy$))
      .subscribe(() => this._publishSubmitEvent());
  }

  private _subscribeBlockSubmit(): void {
    this._messageBus
      .pipe(ofType(PUBLIC_EVENTS.SUBMIT_FORM), takeUntil(this.destroy$))
      .subscribe(() => this._disableSubmitButton(FormState.BLOCKED));

    this._messageBus
      .pipe(ofType(PUBLIC_EVENTS.UNLOCK_BUTTON), takeUntil(this.destroy$))
      .subscribe(() => this._disableSubmitButton(FormState.AVAILABLE));

    this._messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.BLOCK_FORM),
        map(event => event.data),
        takeUntil(this.destroy$)
      )
      .subscribe((state: FormState) => {
        this._disableSubmitButton(state);
        this._disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER, CARD_NUMBER_IFRAME);
        this._disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE, EXPIRATION_DATE_IFRAME);
        this._disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_SECURITY_CODE, SECURITY_CODE_IFRAME);
      });
  }

  private _validateFieldsAfterSubmit(): void {
    this._messageBus
      .pipe(
        ofType(PRIVATE_EVENTS.VALIDATE_FORM),
        map(event => event.data),
        takeUntil(this.destroy$)
      )
      .subscribe((data: IValidationMessageBus) => {
        const { cardNumber, expirationDate, securityCode } = data;
        if (!cardNumber.state) {
          this._publishValidatedFieldState(cardNumber, MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD);
        }
        if (!expirationDate.state) {
          this._publishValidatedFieldState(expirationDate, MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD);
        }
        if (!securityCode.state) {
          this._publishValidatedFieldState(securityCode, MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD);
        }
      });
  }

  private _preventFormSubmit(): void {
    const preventFunction = (event: Event) => event.preventDefault();
    const paymentForm = document.getElementById(this.formId);

    paymentForm.addEventListener(CardFrames.SUBMIT_EVENT, preventFunction);

    this.destroy$.pipe(first()).subscribe(() => {
      paymentForm.removeEventListener(CardFrames.SUBMIT_EVENT, preventFunction);
    });
  }
}
