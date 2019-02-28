import { BrandDetailsType } from '../../imports/cardtype';
import { cardsLogos } from '../../imports/images';
import Validation from './Validation.class';
import BinLookup from './BinLookup.class';

/**
 * Card number validation class
 */
class CardNumber extends Validation {
  private binLookup: BinLookup;
  public brand: BrandDetailsType;

  private _cardType: string;
  private _cardLength: [];
  private static DEFAULT_CARD_LENGTH = 16;

  get cardType(): string {
    return this._cardType;
  }

  get cardLength(): [] {
    return this._cardLength;
  }

  constructor(fieldId: string) {
    super();
    this.binLookup = new BinLookup();
    this.brand = null;
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    CardNumber.setMaxLengthAttribute(
      fieldInstance,
      CardNumber.DEFAULT_CARD_LENGTH
    );
    this.inputValidation(fieldId);
  }

  private inputValidation(fieldId: string) {
    this.inputValidationListener(fieldId);
    this.postMessageEventListener(fieldId);
  }

  /**
   * Listens to keypress action on credit card field and attach validation methods
   * @param fieldId
   */
  private inputValidationListener(fieldId: string) {
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      if (!CardNumber.isCharNumber(event)) {
        event.preventDefault();
        return false;
      }
      return true;
    });
  }

  private postMessageEventListener(fieldId: string) {
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    window.addEventListener(
      'message',
      () => {
        if (CardNumber.setErrorMessage(fieldInstance, 'card-number-error')) {
          if (this.validateCreditCard(fieldInstance.value)) {
            localStorage.setItem('cardNumber', fieldInstance.value);
            fieldInstance.classList.remove('error');
          } else {
            CardNumber.customErrorMessage(
              'card number is invalid',
              'card-number-error'
            );
          }
        }
      },
      false
    );
  }

  /**
   *  Format input value of card number field due to card type regex
   * @param cardNumber
   */
  private cardNumberFormat(cardNumber: string) {
    const brand = this.binLookup.binLookup(cardNumber);
    if (brand.format) {
      const regex = new RegExp(brand.format);
      return cardNumber.replace(regex, '$1 $1 $1 $1');
    }
  }

  /**
   * Validate a card number
   * @param cardNumber the card number to validate
   * @return whether the card number is valid
   */
  private validateCreditCard(cardNumber: string) {
    const brand = this.binLookup.binLookup(cardNumber);
    if (brand.type === null) {
      return true;
    }
    this.brand = brand;
    let result = true;
    if (brand.luhn) {
      result = CardNumber.luhnCheck(cardNumber);
    }
    return result;
  }

  /**
   * Luhn Algorith
   * From the right:
   *    Step 1: take the value of this digit
   *    Step 2: if the offset from the end is even
   *    Step 3: double the value, then sum the digits
   *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
   */
  private static luhnCheck(cardNumber: string) {
    const arry = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
    let len = cardNumber.length,
      bit = 1,
      sum = 0;

    while (len) {
      const val = parseInt(cardNumber.charAt(--len), 10);
      sum += (bit ^= 1) ? arry[val] : val;
    }

    return sum && sum % 10 === 0;
  }

  /**
   * Returns card logo due to brand type setting, if no brand has been specified, returns standard 'chip' card
   */
  private getCardLogo() {
    let key = 'chip';
    if (this.brand && this.brand.type) {
      const brandName = this.brand.type.toLowerCase();
      if (cardsLogos[brandName]) {
        key = brandName;
      }
    }
    return cardsLogos[key];
  }

  /**
   * Method triggered on submit whole form - checks if cardNumber is valid and checks whether security code corresponds with card number
   * @param cardNumber
   */
  public cardNumberSecurityCodeMatch(cardNumber: string) {
    window.addEventListener('message', () => {
      if (this.validateCreditCard(cardNumber)) {
        const securityCode = localStorage.getItem('securityCode');
        // const cardNumberLastChars = CardNumber.getLastNChars(
        //   cardNumber,
        //   this.brand.cvcLength[0]
        // );
        // if (
        //   securityCode.length === this.brand.cvcLength[0] &&
        //   securityCode === cardNumberLastChars
        // ) {
        //   return true;
        // }
      }
      return false;
    });
  }
}

export default CardNumber;
