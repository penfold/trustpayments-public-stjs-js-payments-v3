import { Service } from 'typedi';
import { IApplePayError } from './IApplePayError';
import { ApplePaySessionErrorCode } from './ApplePaySessionErrorCode';
import { ApplePayErrorContactField } from './ApplePayErrorContactField';

@Service()
export class ApplePayErrorService {
  create(
    content: ApplePaySessionErrorCode,
    contactField?: ApplePayErrorContactField,
    message?: string
  ): IApplePayError {
    return new window.ApplePayError(content, contactField, message);
  }
}
