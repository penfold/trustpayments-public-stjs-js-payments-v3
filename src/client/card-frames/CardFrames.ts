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
import { PAY, PLEASE_WAIT, PROCESSING } from '../../application/core/models/constants/Translations';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import Container from 'typedi';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { TranslatorToken } from '../../shared/dependency-injection/InjectionTokens';
import { Locale } from '../../application/core/shared/translator/Locale';
import { IComponentsIds } from '../../shared/model/config/IComponentsIds';
import { IStJwtPayload } from '../../application/core/models/IStJwtPayload';

export class CardFrames {
  private static CARD_NUMBER_FIELD_NAME = 'pan';
  private static CLICK_EVENT = 'click';
  private static COMPLETE_FORM_NUMBER_OF_FIELDS = 3;
  private static EXPIRY_DATE_FIELD_NAME = 'expirydate';
  private static INPUT_EVENT = 'input';
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static ONLY_CVV_NUMBER_OF_FIELDS = 1;
  private static SUBMIT_EVENT = 'submit';
  private static SECURITY_CODE_FIELD_NAME = 'securitycode';
  private static SUBMIT_BUTTON_AS_BUTTON_MARKUP = 'button[type="submit"]';
  private static SUBMIT_BUTTON_AS_INPUT_MARKUP = 'input[type="submit"]';
  private static SUBMIT_BUTTON_DISABLED_CLASS = 'st-button-submit__disabled';

  private animatedCard: HTMLIFrameElement;
  private cardNumber: HTMLIFrameElement;
  private expirationDate: HTMLIFrameElement;
  private securityCode: HTMLIFrameElement;
  private validation: Validation;
  private translator: ITranslator;
  private messageBusEvent: IMessageBusEvent<{ message: string; }> = { data: { message: '' }, type: '' };
  private submitButton: HTMLInputElement | HTMLButtonElement;
  private buttonId: string;
  private defaultPaymentType: string;
  private paymentTypes: string[];
  private payMessage: string;
  private pleaseWaitMessage: string;
  private processingMessage: string;
  private fieldsToSubmitLength: number;
  private isCardWithNoCvv: boolean;
  private noFieldConfiguration: boolean;
  private onlyCvvConfiguration: boolean;
  private configurationForStandardCard: boolean;
  private loadAnimatedCard: boolean;
  private config$: Observable<IConfig>;
  protected styles: IStyles;
  /* @todo(typings) The problem with paymentTypes here is that it should be a string[], but if you replace that you will
     eventually find out that you need to pass string[] to URLSearchParams() in the IFrameFactory.create and apparently
     that function doesn't handle array of strings - so either we have bad typings here or we use it incorrectly. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected params: { locale: Locale; origin: string; paymentTypes?: any; defaultPaymentType?: string; };
  protected elementsToRegister: HTMLElement[];
  protected elementsTargets: string[];
  protected jwt: string;
  protected origin: string;
  protected componentIds: IComponentsIds;
  protected submitCallback: (...args: unknown[]) => unknown;
  protected fieldsToSubmit: string[];
  protected messageBus: IMessageBus;
  protected formId: string;
  private destroy$: Observable<void>;

  constructor(
    jwt: string,
    origin: string,
    componentIds: IComponentsIds,
    styles: IStyles,
    paymentTypes: string[],
    defaultPaymentType: string,
    animatedCard: boolean,
    buttonId: string,
    fieldsToSubmit: string[],
    formId: string,
    private configProvider: ConfigProvider,
    private iframeFactory: IframeFactory,
    private frame: Frame,
    private messageBus: IMessageBus,
    private jwtDecoder: JwtDecoder
  ) {
    this.fieldsToSubmit = fieldsToSubmit || ['pan', 'expirydate', 'securitycode'];
    this.elementsToRegister = [];
    this.componentIds = componentIds;
    this.formId = formId;
    this.jwt = jwt;
    this.origin = origin;
    this.styles = this.getStyles(styles);
    this.translator = Container.get(TranslatorToken);
    this.params = { locale: this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.locale || 'en_GB', origin: this.origin };
    this.config$ = this.configProvider.getConfig$();
    this.setInitValues(buttonId, defaultPaymentType, paymentTypes, animatedCard, jwt, formId);
    this.configureFormFieldsAmount(jwt);
    this.styles = this.getStyles(styles);
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  public init(): void {
    this.preventFormSubmit();
    this.createSubmitButton();
    this.initSubscribes();
    this.initCardFrames();
    this.elementsTargets = this.setElementsFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /* @todo(typings) Looks like this fn can take either IStyle or IStyles, hence the `if` inside. All the calls here
     are done with IStyles, but the tests for that class do not give enough confidence to assume so. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getStyles(styles: any) {
    for (const key in styles) {
      if (styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles };
    return styles;
  }

  protected configureFormFieldsAmount(jwt: string): void {
    this.fieldsToSubmitLength = this.fieldsToSubmit.length;
    this.isCardWithNoCvv = jwt && CardFrames.NO_CVV_CARDS.includes(this.getCardType(jwt));
    this.noFieldConfiguration =
      this.fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      this.isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this.onlyCvvConfiguration =
      this.fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      !this.isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this.configurationForStandardCard =
      this.fieldsToSubmitLength === CardFrames.COMPLETE_FORM_NUMBER_OF_FIELDS &&
      this.loadAnimatedCard &&
      !this.isCardWithNoCvv &&
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
    if (this.configurationForStandardCard) {
      return [
        this.componentIds.cardNumber,
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
        this.componentIds.animatedCard,
      ];
    } else if (this.onlyCvvConfiguration) {
      return [this.componentIds.securityCode];
    } else if (this.noFieldConfiguration) {
      return [];
    } else {
      return [
        this.componentIds.cardNumber, //
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
      ];
    }
  }

  private createSubmitButton = (): HTMLInputElement | HTMLButtonElement => {
    const form = document.getElementById(this.formId);

    this.submitButton =
      (document.getElementById(this.buttonId) as HTMLInputElement | HTMLButtonElement) ||
      form.querySelector(CardFrames.SUBMIT_BUTTON_AS_BUTTON_MARKUP) ||
      form.querySelector(CardFrames.SUBMIT_BUTTON_AS_INPUT_MARKUP);
    this.disableSubmitButton(FormState.LOADING);

    this.config$.subscribe(response => {
      const { components } = response;

      if (this.submitButton) {
        this.submitButton.textContent = this.pleaseWaitMessage;
      }

      if (components.startOnLoad) {
        this.disableSubmitButton(FormState.AVAILABLE);
      }
    });

    return this.submitButton;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private disableFormField(state: FormState, eventName: string, target: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: eventName,
    };
    this.messageBus.publish(messageBusEvent);
  }

  private disableSubmitButton(state: FormState): void {
    if (this.submitButton) {
      this.setSubmitButtonProperties(this.submitButton, state);
    }
  }

  private getCardType(jwt: string): string {
    const cardDetails = this.jwtDecoder.decode<IStJwtPayload>(jwt);
    if (cardDetails.payload.pan) {
      return iinLookup.lookup(cardDetails.payload.pan).type;
    }
  }

  private initCardNumberFrame(styles: Record<string, string>): void {
    this.cardNumber = this.iframeFactory.create(CARD_NUMBER_COMPONENT_NAME, CARD_NUMBER_IFRAME, styles, this.params);
    this.elementsToRegister.push(this.cardNumber);
  }

  private initExpiryDateFrame(styles: Record<string, string>): void {
    this.expirationDate = this.iframeFactory.create(
      EXPIRATION_DATE_COMPONENT_NAME,
      EXPIRATION_DATE_IFRAME,
      styles,
      this.params
    );
    this.elementsToRegister.push(this.expirationDate);
  }

  private initSecurityCodeFrame(styles: Record<string, string>): void {
    this.securityCode = this.iframeFactory.create(
      SECURITY_CODE_COMPONENT_NAME,
      SECURITY_CODE_IFRAME,
      styles,
      this.params
    );
    this.elementsToRegister.push(this.securityCode);
  }

  private initAnimatedCardFrame(): void {
    const animatedCardConfig = { ...this.params };
    if (this.paymentTypes !== undefined) {
      animatedCardConfig.paymentTypes = this.paymentTypes;
    }
    if (this.defaultPaymentType !== undefined) {
      animatedCardConfig.defaultPaymentType = this.defaultPaymentType;
    }
    this.animatedCard = this.iframeFactory.create(
      ANIMATED_CARD_COMPONENT_NAME,
      ANIMATED_CARD_COMPONENT_IFRAME,
      {},
      animatedCardConfig,
      -1
    );
    this.elementsToRegister.push(this.animatedCard);
  }

  private initCardFrames(): void {
    const { defaultStyles } = this.styles;
    let { cardNumber, securityCode, expirationDate } = this.styles;
    cardNumber = Object.assign({}, defaultStyles, cardNumber);
    securityCode = Object.assign({}, defaultStyles, securityCode);
    expirationDate = Object.assign({}, defaultStyles, expirationDate);
    if (this.onlyCvvConfiguration) {
      this.initSecurityCodeFrame(securityCode);
    } else if (this.configurationForStandardCard) {
      this.initCardNumberFrame(cardNumber);
      this.initExpiryDateFrame(expirationDate);
      this.initSecurityCodeFrame(securityCode);
      this.initAnimatedCardFrame();
    } else {
      this.initCardNumberFrame(cardNumber);
      this.initExpiryDateFrame(expirationDate);
      this.initSecurityCodeFrame(securityCode);
    }
  }

  private initSubscribes(): void {
    this.submitFormListener();
    this.subscribeBlockSubmit();
    this.validateFieldsAfterSubmit();
    this.setMerchantInputListeners();
  }

  private onInput(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: DomMethods.parseForm(this.formId),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS,
    };
    this.messageBus.publish(messageBusEvent);
  }

  private publishSubmitEvent(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: {
        fieldsToSubmit: this.fieldsToSubmit,
      },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM,
    };
    this.messageBus.publish(messageBusEvent, true);
  }

  private publishValidatedFieldState(field: { message: string; state: boolean }, eventType: string): void {
    this.messageBusEvent.type = eventType;
    this.messageBusEvent.data.message = field.message;
    this.messageBus.publish(this.messageBusEvent);
  }

  private setMerchantInputListeners(): void {
    const els = DomMethods.getAllFormElements(document.getElementById(this.formId));
    for (const el of els) {
      el.addEventListener(CardFrames.INPUT_EVENT, this.onInput.bind(this));
    }
  }

  private setInitValues(
    buttonId: string,
    defaultPaymentType: string,
    paymentTypes: string[],
    loadAnimatedCard: boolean,
    jwt: string,
    formId: string
  ): void {
    this.validation = new Validation();
    this.buttonId = buttonId;
    this.formId = formId;
    this.defaultPaymentType = defaultPaymentType;
    this.paymentTypes = paymentTypes;
    this.jwt = jwt;
    this.payMessage = this.translator.translate(PAY);
    this.pleaseWaitMessage = this.translator.translate(PLEASE_WAIT);
    this.processingMessage = `${this.translator.translate(PROCESSING)} ...`;
    this.loadAnimatedCard = loadAnimatedCard !== undefined ? loadAnimatedCard : true;

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.LOCALE_CHANGED), takeUntil(this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY))))
      .subscribe(() => {
        this.payMessage = this.translator.translate(PAY);
        this.processingMessage = `${this.translator.translate(PROCESSING)} ...`;
        this.submitButton.textContent = this.submitButton.disabled ? this.processingMessage : this.payMessage;
      });
  }

  private setSubmitButtonProperties(element: HTMLInputElement | HTMLButtonElement, state: FormState): HTMLElement {
    let disabledState;
    if (state === FormState.BLOCKED) {
      element.textContent = this.processingMessage;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
      disabledState = true;
    } else if (state === FormState.COMPLETE) {
      element.textContent = this.payMessage;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS); // Keep it locked but return it to original text
      disabledState = true;
    } else if (state === FormState.LOADING) {
      element.textContent = this.pleaseWaitMessage;
      disabledState = true;
    } else {
      element.textContent = this.payMessage;
      element.classList.remove(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
      disabledState = false;
    }
    element.disabled = disabledState;
    return element;
  }

  private submitFormListener(): void {
    if (this.submitButton) {
      const clickHandler = () => this.publishSubmitEvent();
      this.submitButton.addEventListener(CardFrames.CLICK_EVENT, clickHandler);

      this.destroy$.pipe(first()).subscribe(() => {
        this.submitButton.removeEventListener(CardFrames.CLICK_EVENT, clickHandler);
      });
    }

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.CALL_SUBMIT_EVENT), takeUntil(this.destroy$))
      .subscribe(() => this.publishSubmitEvent());
  }

  private subscribeBlockSubmit(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.SUBMIT_FORM), takeUntil(this.destroy$))
      .subscribe(() => this.disableSubmitButton(FormState.BLOCKED));

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.UNLOCK_BUTTON), takeUntil(this.destroy$))
      .subscribe(() => this.disableSubmitButton(FormState.AVAILABLE));

    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.BLOCK_FORM),
        map(event => event.data),
        takeUntil(this.destroy$)
      )
      .subscribe((state: FormState) => {
        this.disableSubmitButton(state);
        this.disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER, CARD_NUMBER_IFRAME);
        this.disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE, EXPIRATION_DATE_IFRAME);
        this.disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_SECURITY_CODE, SECURITY_CODE_IFRAME);
      });
  }

  private validateFieldsAfterSubmit(): void {
    this.messageBus
      .pipe(
        ofType(PRIVATE_EVENTS.VALIDATE_FORM),
        map(event => event.data),
        takeUntil(this.destroy$)
      )
      .subscribe((data: IValidationMessageBus) => {
        const { cardNumber, expirationDate, securityCode } = data;
        if (!cardNumber.state) {
          this.publishValidatedFieldState(cardNumber, MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD);
        }
        if (!expirationDate.state) {
          this.publishValidatedFieldState(expirationDate, MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD);
        }
        if (!securityCode.state) {
          this.publishValidatedFieldState(securityCode, MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD);
        }
      });
  }

  private preventFormSubmit(): void {
    const preventFunction = (event: Event) => event.preventDefault();
    const paymentForm = document.getElementById(this.formId);

    paymentForm.addEventListener(CardFrames.SUBMIT_EVENT, preventFunction);

    this.destroy$.pipe(first()).subscribe(() => {
      paymentForm.removeEventListener(CardFrames.SUBMIT_EVENT, preventFunction);
    });
  }
}
