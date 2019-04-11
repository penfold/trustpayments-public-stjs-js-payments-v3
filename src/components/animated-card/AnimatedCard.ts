import BinLookup from '../../core/shared/BinLookup';
import DOMMethods from '../../core/shared/DomMethods';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 * Defines animated card, it's 'stateless' component which only receives data validated previously by other components.
 */
class AnimatedCard {
  public static CARD_BRANDS = {
    AMEX: 'AMEX',
    ASTROPAYCARD: 'ASTROPAYCARD',
    DEFAULT: 'DEFAULT',
    DINERS: 'DINERS',
    DISCOVER: 'DISCOVER',
    JCB: 'JCB',
    MAESTRO: 'MAESTRO',
    MASTERCARD: 'MASTERCARD',
    PIBA: 'PIBA',
    VISA: 'VISA'
  };
  public static CARD_CLASSES = {
    CLASS_BACK: 'st-animated-card__back',
    CLASS_FOR_ANIMATION: 'st-animated-card__flip-card',
    CLASS_FRONT: 'st-animated-card__front',
    CLASS_MAIN: 'st-animated-card',
    CLASS_SIDE: 'st-animated-card__side',
    CLASS_LOGO_WRAPPER: 'st-animated-card-payment-logo',
    CLASS_LOGO: 'st-animated-card__payment-logo',
    CLASS_LOGO_DEFAULT: 'st-animated-card__payment-logo-default',
    CLASS_LOGO_IMAGE: 'st-animated-card__payment-logo-img'
  };
  public static CARD_DETAILS_PLACEHOLDERS = {
    CARD_NUMBER: 'XXXX XXXX XXXX XXXX',
    EXPIRATION_DATE: 'MM/YY',
    SECURITY_CODE: 'XXX',
    TYPE: 'DEFAULT'
  };
  public static CHIP_LOGO_ID: string = 'st-chip-logo';

  public static COMPONENTS_IDS = {
    CARD_NUMBER: 'cardNumber',
    EXPIRATION_DATE: 'expirationDate',
    SECURITY_CODE: 'securityCode'
  };
  public static NOT_FLIPPED_CARDS = ['AMEX'];
  public static PAYMENT_LOGO_ID: string = 'st-payment-logo';

  // @ts-ignore
  public static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  /**
   * Returns theme class for specified theme
   * @param theme
   */
  public returnThemeClass = (theme: string) => `st-animated-card__${theme}`;

  public animatedCardBack: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_BACK);
  public animatedCardExpirationDate: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_EXPIRATION_DATE_ID);
  public animatedCardFront: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_FRONT);
  public animatedCardPan: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_ID);
  public animatedCardSecurityCode: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_ID);
  public animatedCardSecurityCodeFront: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_ID
  );
  public animatedCardLogoBackground: HTMLElement = document.getElementById(
    AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER
  );
  public binLookup: BinLookup;
  public cardDetails: any = {
    cardNumber: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER,
    expirationDate: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE,
    securityCode: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE,
    type: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.TYPE
  };
  public cardElement: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  public messageBus: MessageBus;

  constructor() {
    this.binLookup = new BinLookup();
    this.messageBus = new MessageBus();
    this.setDefaultImagesAttributes();
    this.setDefaultInputsValues();
    this.setSubscribeEvents();
  }

  /**
   * Resets styles on both sides of credit card to default theme
   */
  public resetToDefaultTheme() {
    this.animatedCardSecurityCodeFront.textContent = '';
    this.animatedCardFront.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_FRONT}`
    );
    this.animatedCardBack.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_BACK}`
    );
  }

  /**
   * Sets theme properties: css settings and card type
   * @param themeObject
   */
  public setThemeClasses(themeObject: { type: string }) {
    const { type } = themeObject;

    if (type === 'default') {
      DOMMethods.addClassToList(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    } else {
      DOMMethods.addClassToList(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO}`);
      DOMMethods.removeClassFromList(
        this.animatedCardLogoBackground,
        `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`
      );
    }
    DOMMethods.addClassToList(this.animatedCardFront, this.returnThemeClass(type));
    DOMMethods.addClassToList(this.animatedCardBack, this.returnThemeClass(type));
  }

  /**
   *
   * @param themeObject
   */
  public setThemeLogo(themeObject: { type: string; logo: string }) {
    const { logo, type } = themeObject;
    return logo ? this.addCardLogo(logo, type) : null;
  }

  /**
   * Sets theme object with theme properties: type of card and logo of card
   * @param type
   * @param logo
   */
  public static setThemeObject(type: string, logo: string) {
    const themeObject = { type: '', logo: '' };
    themeObject.type = type.toLowerCase();
    themeObject.logo = logo;
    return themeObject;
  }

  /**
   * Sets card theme according to card brand coming from binLookup()
   */
  public setCardTheme() {
    let themeObject;
    this.resetToDefaultTheme();
    switch (this.cardDetails.type) {
      case AnimatedCard.CARD_BRANDS.AMEX:
        this.animatedCardSecurityCodeFront.textContent = AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE;
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.AMEX, cardsLogos.amex);
        break;
      case AnimatedCard.CARD_BRANDS.ASTROPAYCARD:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.ASTROPAYCARD, cardsLogos.astropaycard);
        break;
      case AnimatedCard.CARD_BRANDS.DINERS:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.DINERS, cardsLogos.diners);
        break;
      case AnimatedCard.CARD_BRANDS.DISCOVER:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.DISCOVER, cardsLogos.discover);
        break;
      case AnimatedCard.CARD_BRANDS.JCB:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.JCB, cardsLogos.jcb);
        break;
      case AnimatedCard.CARD_BRANDS.MAESTRO:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.MAESTRO, cardsLogos.maestro);
        break;
      case AnimatedCard.CARD_BRANDS.MASTERCARD:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.MASTERCARD, cardsLogos.mastercard);
        break;
      case AnimatedCard.CARD_BRANDS.PIBA:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.PIBA, cardsLogos.piba);
        break;
      case AnimatedCard.CARD_BRANDS.VISA:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.VISA, cardsLogos.visa);
        break;
      case AnimatedCard.CARD_BRANDS.DEFAULT:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.DEFAULT, '');
        this.removeCardLogo();
        break;
      default:
        themeObject = AnimatedCard.setThemeObject(AnimatedCard.CARD_BRANDS.DEFAULT, '');
        this.removeCardLogo();
    }
    this.setThemeLogo(themeObject);
    this.setThemeClasses(themeObject);
    return themeObject;
  }

  /**
   * For particular type of card it sets security code on front side of card
   */
  public setSecurityCodeOnProperSide = () =>
    this.cardDetails.type === AnimatedCard.CARD_BRANDS.AMEX
      ? this.animatedCardSecurityCodeFront
      : this.animatedCardSecurityCode;

  /**
   * Checks if given card should not be flipped
   */
  public shouldFlipCard(type: string) {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(type)) {
      if (!this.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this.flipCard();
      }
    }
  }

  /**
   * Flips card to see details on revers
   */
  public flipCard = () => this.cardElement.classList.add(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION);

  /**
   * Flips back card by clearing classes
   */
  public flipCardBack(type: string) {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(type)) {
      if (this.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this.cardElement.setAttribute('class', Selectors.ANIMATED_CARD_INPUT_SELECTOR);
      }
    }
  }

  /**
   *
   * @param logo
   * @param type
   */
  public addCardLogo(logo: string, type: string) {
    if (!document.getElementById(AnimatedCard.PAYMENT_LOGO_ID)) {
      const element = DOMMethods.setMultipleAttributes.apply(this, [
        { alt: type, src: logo, class: AnimatedCard.CARD_CLASSES.CLASS_LOGO_IMAGE, id: AnimatedCard.PAYMENT_LOGO_ID },
        'img'
      ]);
      DOMMethods.appendChildIntoDOM(AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER, element);
      DOMMethods.setProperty.apply(this, ['src', logo, AnimatedCard.PAYMENT_LOGO_ID]);
    } else {
      DOMMethods.setProperty.apply(this, ['src', logo, AnimatedCard.PAYMENT_LOGO_ID]);
    }
  }

  /**
   * Removes cards logo when it's theme changed  to default
   */
  public removeCardLogo = () =>
    DOMMethods.removeChildFromDOM.apply(this, [
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER,
      AnimatedCard.PAYMENT_LOGO_ID
    ]);

  /**
   * Sets default attributes for card images - card logo and chip image
   */
  public setDefaultImagesAttributes() {
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.chip, AnimatedCard.CHIP_LOGO_ID]);
    DOMMethods.setProperty.apply(this, [
      'class',
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT,
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER
    ]);
  }

  /**
   * Sets placeholders for each editable value on card (card number, expiration date, security code)
   */
  public setDefaultInputsValues() {
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
    this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
    this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
  }

  /**
   * Set one of three values on animated card
   * @param data
   * @param placeholder
   */
  public static setCardDetail(data: any, placeholder: string) {
    let { value } = data;
    return value ? value : placeholder;
  }

  /**
   * Listens to changes coming from Card Number field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onCardNumberChanged(data: any) {
    this.cardDetails.type = this.binLookup.binLookup(data.value).type;
    this.cardDetails.cardNumber = AnimatedCard.setCardDetail(data, AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER);
    this.flipCardBack(this.cardDetails.type);
    this.setCardTheme();
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
  }

  /**
   * Listens to changes coming from Expiration Date field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onExpirationDateChanged(data: any) {
    this.cardDetails.expirationDate = AnimatedCard.setCardDetail(
      data,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
    );
    this.flipCardBack(this.cardDetails.type);
    this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
  }

  /**
   * Listens to changes coming from Security Code field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onSecurityCodeChanged(data: any) {
    this.cardDetails.securityCode = AnimatedCard.setCardDetail(
      data,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
    );
    this.shouldFlipCard(this.cardDetails.type);
    this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
  }

  /**
   * Sets subscribe events on every editable field of card
   */
  public setSubscribeEvents() {
    this.messageBus.subscribe(MessageBus.EVENTS.CARD_NUMBER_CHANGE, (data: any) => this.onCardNumberChanged(data));
    this.messageBus.subscribe(MessageBus.EVENTS.EXPIRATION_DATE_CHANGE, (data: any) =>
      this.onExpirationDateChanged(data)
    );
    this.messageBus.subscribe(MessageBus.EVENTS.SECURITY_CODE_CHANGE, (data: any) => this.onSecurityCodeChanged(data));
  }
}

export default AnimatedCard;
