import { ValidationError } from 'joi';

export class APMConfigError extends Error {
  constructor(readonly validationErrors: ValidationError[]) {
    super(`APM config error: ${validationErrors.map(error => error.message).join(', ')}`);
    Object.setPrototypeOf(this, APMConfigError.prototype); // required for instanceof check
  }
}
