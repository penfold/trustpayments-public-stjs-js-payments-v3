import { IApplePayError } from './IApplePayError';
import { ApplePaySessionErrorCode } from './ApplePaySessionErrorCode';

export class ApplePayErrorMock implements IApplePayError {
  code: ApplePaySessionErrorCode;
  contactField: string;
  message: string;

  constructor(code: ApplePaySessionErrorCode, contactField?: string, message?: string) {
    this.code = code;
    this.contactField = contactField;
    this.message = message;
  }
}
