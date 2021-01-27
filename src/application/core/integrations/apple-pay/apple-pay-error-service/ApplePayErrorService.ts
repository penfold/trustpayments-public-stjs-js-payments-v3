import { Service } from 'typedi';
import { IApplePayError } from './IApplePayError';
import { ApplePaySessionErrorCode } from './ApplePaySessionErrorCode';
import { ApplePayErrorContactField } from './ApplePayErrorContactField';

const ApplePayError = (window as any).ApplePayError;

@Service()
export class ApplePayErrorService {
  create(
    content: ApplePaySessionErrorCode,
    contactField?: ApplePayErrorContactField,
    message?: string
  ): IApplePayError {
    return new ApplePayError(content, contactField, message);
  }
}
