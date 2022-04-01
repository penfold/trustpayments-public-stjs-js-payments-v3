import { Observable } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';
import Container, { Service } from 'typedi';
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
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../shared/model/config/IConfig';
import { PRIVATE_EVENTS, PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { TranslatorToken } from '../../shared/dependency-injection/InjectionTokens';
import { Locale } from '../../application/core/shared/translator/Locale';
import { IComponentsIds } from '../../shared/model/config/IComponentsIds';
import { IStJwtPayload } from '../../application/core/models/IStJwtPayload';
import { EventScope } from '../../application/core/models/constants/EventScope';
import { PayButton } from '../pay-button/PayButton';
import { PayButtonFactory } from '../pay-button/PayButtonFactory';

@Service()
export class CardFrames {
  private animatedCard: HTMLIFrameElement;
  private cardNumber: HTMLIFrameElement;
  private expirationDate: HTMLIFrameElement;
  private securityCode: HTMLIFrameElement;
  private validation: Validation;
  private translator: ITranslator;
  private messageBusEvent: IMessageBusEvent<{ message: string; }> = { data: { message: '' }, type: '' };
  private defaultPaymentType: string;
  private paymentTypes: string[];
  private fieldsToSubmitLength: number;
  private noFieldConfiguration: boolean;
  private onlyCvvConfiguration: boolean;
  private configurationForStandardCard: boolean;
  private loadAnimatedCard: boolean;
  private config$: Observable<IConfig>;
  private jwt: string;
  private componentIds: IComponentsIds;
  private formId: string;
  private destroy$: Observable<void>;
  private styles: IStyles;
  /* @todo(typings) The problem with paymentTypes here is that it should be a string[], but if you replace that you will
     eventually find out that you need to pass string[] to URLSearchParams() in the IFrameFactory.create and apparently
     that function doesn't handle array of strings - so either we have bad typings here or we use it incorrectly. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private params: { locale: Locale; origin: string; paymentTypes?: any; defaultPaymentType?: string; };
  private elementsToRegister: HTMLElement[];
  private origin: string;
  private fieldsToSubmit: string[];
  private elementsTargets: string[];
  private payButton: PayButton;

  constructor(
    private configProvider: ConfigProvider,
    private iframeFactory: IframeFactory,
    private frame: Frame,
    private messageBus: IMessageBus,
    private jwtDecoder: JwtDecoder,
    private payButtonFactory: PayButtonFactory
  ) {
    this.payButton = this.payButtonFactory.create();
  }

  init(): void {
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      this.fieldsToSubmit = config.fieldsToSubmit || ['pan', 'expirydate', 'securitycode'];
      this.elementsToRegister = [];
      this.componentIds = config.componentIds;
      this.formId = config.formId;
      this.jwt = config.jwt;
      this.origin = config.origin;
      this.styles = this.getStyles(config.styles);
      this.translator = Container.get(TranslatorToken);
      this.params = {
        locale: this.jwtDecoder.decode<IStJwtPayload>(config.jwt).payload.locale || 'en_GB',
        origin: this.origin,
      };
      this.config$ = this.configProvider.getConfig$();
      this.setInitValues(config.components.defaultPaymentType, config.components.paymentTypes, config.animatedCard, config.jwt, config.formId);
      this.configureFormFieldsAmount(config.jwt);
      this.styles = this.getStyles(config.styles);
      this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
      this.payButton.init();
    });

    this.preventFormSubmit();
    this.initSubscribes();
    this.initCardFrames();
    this.elementsTargets = this.setElementsFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /* @todo(typings) Looks like this fn can take either IStyle or IStyles, hence the `if` inside. All the calls here
     are done with IStyles, but the tests for that class do not give enough confidence to assume so. */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getStyles(styles: any) {
    for(const key in styles){
      if(styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles };
    return styles;
  }

  private configureFormFieldsAmount(jwt: string): void {
    const onlyCvvNumberOfFields = 1;
    const completeFormNumberOfFields = 3;

    this.fieldsToSubmitLength = this.fieldsToSubmit.length;
    this.noFieldConfiguration =
      this.fieldsToSubmitLength === onlyCvvNumberOfFields &&
      this.fieldsToSubmit.includes('securitycode');
    this.onlyCvvConfiguration =
      this.fieldsToSubmitLength === onlyCvvNumberOfFields &&
      this.fieldsToSubmit.includes('securitycode');
    this.configurationForStandardCard =
      this.fieldsToSubmitLength === completeFormNumberOfFields &&
      this.loadAnimatedCard &&
      this.fieldsToSubmit.includes('pan') &&
      this.fieldsToSubmit.includes('expirydate') &&
      this.fieldsToSubmit.includes('securitycode');
  }

  private registerElements(fields: HTMLElement[], targets: string[]): void {
    if(fields.length === targets.length) {
      targets.forEach((item, index) => {
        const element: HTMLElement = document.getElementById(item);
        if(element !== null) {
          element.appendChild(fields[index]);
        }
      });

      this.destroy$.pipe(first()).subscribe(() => {
        targets.forEach((item, index) => {
          const element: HTMLElement = document.getElementById(item);
          const iframe: HTMLElement = fields[index];
          if(element && iframe && iframe.parentElement === element) {
            element.removeChild(iframe);
          }
        });
      });
    }
  }

  private setElementsFields(): string[] {
    if(this.configurationForStandardCard) {
      return [
        this.componentIds.cardNumber,
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
        this.componentIds.animatedCard,
      ];
    } else if(this.onlyCvvConfiguration) {
      return [this.componentIds.securityCode];
    } else if(this.noFieldConfiguration) {
      return [];
    } else {
      return [
        this.componentIds.cardNumber,
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
      ];
    }
  }

  private disableFormField(state: FormState, eventName: string): void {
    this.messageBus.publish({
      data: state,
      type: eventName,
    });
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
    if(this.paymentTypes !== undefined) {
      animatedCardConfig.paymentTypes = this.paymentTypes;
    }
    if(this.defaultPaymentType !== undefined) {
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
    if(this.onlyCvvConfiguration) {
      this.initSecurityCodeFrame(securityCode);
    } else if(this.configurationForStandardCard) {
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
    this.messageBus.publish(messageBusEvent, EventScope.ALL_FRAMES);
  }

  private publishValidatedFieldState(field: { message: string; state: boolean }, eventType: string): void {
    this.messageBusEvent.type = eventType;
    this.messageBusEvent.data.message = field.message;
    this.messageBus.publish(this.messageBusEvent);
  }

  private setMerchantInputListeners(): void {
    const els = DomMethods.getAllFormElements(document.getElementById(this.formId));
    for(const el of els){
      el.addEventListener('input', this.onInput.bind(this));
    }
  }

  private setInitValues(
    defaultPaymentType: string,
    paymentTypes: string[],
    loadAnimatedCard: boolean,
    jwt: string,
    formId: string
  ): void {
    this.validation = new Validation();
    this.formId = formId;
    this.defaultPaymentType = defaultPaymentType;
    this.paymentTypes = paymentTypes;
    this.jwt = jwt;
    this.loadAnimatedCard = loadAnimatedCard !== undefined ? loadAnimatedCard : true;
  }

  private submitFormListener(): void {
    const clickHandler = () => this.publishSubmitEvent();
    this.payButton.addClickHandler(clickHandler);

    this.destroy$.pipe(first()).subscribe(() => {
      this.payButton.removeClickHandler(clickHandler);
    });

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.CALL_SUBMIT_EVENT), takeUntil(this.destroy$))
      .subscribe(() => this.publishSubmitEvent());
  }

  private subscribeBlockSubmit(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.SUBMIT_FORM), takeUntil(this.destroy$))
      .subscribe(() => this.payButton.disable(FormState.BLOCKED));

    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.BLOCK_FORM),
        map(event => event.data),
        takeUntil(this.destroy$)
      )
      .subscribe((state: FormState) => {
        this.payButton.disable(state);
        this.disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER);
        this.disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE);
        this.disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_SECURITY_CODE);
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
        if(!cardNumber.state) {
          this.publishValidatedFieldState(cardNumber, MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD);
        }
        if(!expirationDate.state) {
          this.publishValidatedFieldState(expirationDate, MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD);
        }
        if(!securityCode.state) {
          this.publishValidatedFieldState(securityCode, MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD);
        }
      });
  }

  private preventFormSubmit(): void {
    const preventFunction = (event: Event) => event.preventDefault();
    const paymentForm = document.getElementById(this.formId);

    paymentForm.addEventListener('submit', preventFunction);

    this.destroy$.pipe(first()).subscribe(() => {
      paymentForm.removeEventListener('submit', preventFunction);
    });
  }
}
