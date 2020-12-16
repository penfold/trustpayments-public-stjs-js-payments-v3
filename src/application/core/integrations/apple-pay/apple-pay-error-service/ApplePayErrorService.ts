import { Service } from 'typedi';
import { IApplePayError } from './IApplePayError';
import { Translator } from '../../../shared/translator/Translator';
import { ApplePayErrorCode } from './ApplePayErrorCode';
import { Locale } from '../../../shared/translator/Locale';

const ApplePayError = (window as any).ApplePayError;

@Service()
export class ApplePayErrorService {
  create(content: ApplePayErrorCode, locale: Locale): IApplePayError {
    const translation: Translator = new Translator(locale);

    return new ApplePayError(translation.translate(content));
  }
}
