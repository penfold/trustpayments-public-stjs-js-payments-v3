export class InvalidResponseError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidResponseError.prototype);
  }
}
