export class ApplePayInitError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, ApplePayInitError.prototype); // required for instanceof check
  }
}
