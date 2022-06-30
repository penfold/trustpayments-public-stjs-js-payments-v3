export class GatewayFetchError extends Error {
  constructor(message?: string, readonly originalErrorMessage?: string) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GatewayFetchError);
    }
    Object.setPrototypeOf(this, GatewayFetchError.prototype); // required for instanceof check
  }
}
