export class APMInitError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, APMInitError.prototype); // required for instanceof check
  }
}
