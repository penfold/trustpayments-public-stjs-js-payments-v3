import { TimeoutDetails } from './RequestTimeout'

export class RequestTimeoutError extends Error {
  constructor(message?: string, readonly timeoutDetails?: TimeoutDetails) {
    super(message);
    if (Error.captureStackTrace) { 
      Error.captureStackTrace(this, RequestTimeoutError);
    }
    Object.setPrototypeOf(this, RequestTimeoutError.prototype); // required for instanceof check
  }
}