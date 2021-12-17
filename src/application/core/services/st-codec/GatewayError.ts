export class GatewayError extends Error {
  constructor(message?: string, readonly response?: unknown) {
    super(message);
    if (Error.captureStackTrace) { 
      Error.captureStackTrace(this, GatewayError);
    }
    Object.setPrototypeOf(this, GatewayError.prototype); // required for instanceof check
  }
}