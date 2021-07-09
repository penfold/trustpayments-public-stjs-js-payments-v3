declare module '@trustpayments/js-payments-card' {
  class Card {
    constructor(...args: unknown[]);

    onCardNumberChange(...args: unknown[]): void;
    onExpirationDateChange(...args: unknown[]): void;
    onSecurityCodeChange(...args: unknown[]): void;
    onFieldFocusOrBlur(...args: unknown[]): void;
  }
  export = Card;
}
