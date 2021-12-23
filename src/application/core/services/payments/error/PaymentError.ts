export class PaymentError extends Error {
  private phase: 'init' | 'process';

  static duringInit(message: string, paymentMethodName: string, errorData?: Error | unknown): PaymentError {
    const error = new PaymentError(message, paymentMethodName, errorData);
    error.phase = 'init';

    return error;
  }

  static duringProcess(message: string, paymentMethodName: string, errorData?: Error | unknown): PaymentError {
    const error = new PaymentError(message, paymentMethodName, errorData);
    error.phase = 'process';

    return error;
  }

  private constructor(message: string, readonly paymentMethodName: string, readonly errorData?: Error | unknown) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PaymentError);
    }
    Object.setPrototypeOf(this, PaymentError.prototype); // required for instanceof check
  }

  isInitError(): boolean {
    return this.phase === 'init';
  }

  isProcessError(): boolean {
    return this.phase === 'process';
  }
}
