import { IApplePayError } from './IApplePayError';
import { ApplePayErrorCode } from './ApplePayErrorCode';

export class ApplePayErrorMock implements IApplePayError {
  code: ApplePayErrorCode;
  contactField: string;
  message: string;

  constructor(code: ApplePayErrorCode, contactField?: string, message?: string) {
    this.code = code;
    this.contactField = contactField;
    this.message = message;
  }
}
