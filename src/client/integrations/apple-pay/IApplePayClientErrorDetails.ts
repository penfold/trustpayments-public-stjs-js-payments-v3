import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';

export interface IApplePayClientErrorDetails {
  errorCode: ApplePayClientErrorCode;
  errorMessage: string;
}
