export class FrameCommunicationError extends Error {
  constructor(
    message: string,
    readonly event: unknown,
    readonly sourceFrame: string,
    readonly targetFrame: string,
    readonly originalError?: Error,
  ) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FrameCommunicationError);
    }
    Object.setPrototypeOf(this, FrameCommunicationError.prototype); // required for instanceof check
  }
}
