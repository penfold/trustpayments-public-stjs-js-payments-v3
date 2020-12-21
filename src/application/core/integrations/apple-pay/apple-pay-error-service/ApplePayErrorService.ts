import { Service } from 'typedi';
import { IApplePayError } from './IApplePayError';
import { ApplePayErrorCode } from './ApplePayErrorCode';
import { ApplePayErrorContactField } from './ApplePayErrorContactField';
import { Locale } from '../../../shared/translator/Locale';
import { Translator } from '../../../shared/translator/Translator';

const ApplePayError = (window as any).ApplePayError;

@Service()
export class ApplePayErrorService {
  create(
    content: ApplePayErrorCode,
    locale: Locale,
    contactField?: ApplePayErrorContactField,
    message?: string
  ): IApplePayError {
    const translation: Translator = new Translator(locale);

    return new ApplePayError(translation.translate(content), contactField, message);
  }
}
