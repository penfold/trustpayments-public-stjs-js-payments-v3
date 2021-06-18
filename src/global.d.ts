declare module '@trustpayments/js-payments-card' {
  class Card {
    constructor(...args: any[]);

    onCardNumberChange(...args: any[]): void;
    onExpirationDateChange(...args: any[]): void;
    onSecurityCodeChange(...args: any[]): void;
    onFieldFocusOrBlur(...args: any[]): void;
  }
  export = Card;
}
