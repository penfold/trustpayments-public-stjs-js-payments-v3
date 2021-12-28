export class CardinalError extends Error {
  constructor(message?: string, readonly response?: unknown) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CardinalError);
    }
    Object.setPrototypeOf(this, CardinalError.prototype);
  }
}
