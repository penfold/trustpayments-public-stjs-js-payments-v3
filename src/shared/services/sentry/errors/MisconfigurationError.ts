export class MisconfigurationError extends Error {
  constructor(message?: string, readonly previousError?: Error) {
    super(message);
    if (Error.captureStackTrace) { 
      Error.captureStackTrace(this, MisconfigurationError);
    }
    Object.setPrototypeOf(this, MisconfigurationError.prototype); // required for instanceof check
  }
}