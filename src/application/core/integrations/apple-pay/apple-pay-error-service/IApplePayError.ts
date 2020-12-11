import { ApplePayErrorCode } from './ApplePayErrorCode';

export interface IApplePayError {
  code: ApplePayErrorCode;
  contactField?: string;
  message?: string;
}
