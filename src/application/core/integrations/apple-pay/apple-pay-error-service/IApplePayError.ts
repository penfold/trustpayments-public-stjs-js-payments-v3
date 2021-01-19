import { ApplePaySessionErrorCode } from './ApplePaySessionErrorCode';

export interface IApplePayError {
  code: ApplePaySessionErrorCode;
  contactField?: string | null;
  message?: string;
}
