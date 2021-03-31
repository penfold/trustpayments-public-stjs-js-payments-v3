import i18next, { Resource } from 'i18next';
import { Service } from 'typedi';
import { Locale } from './Locale';
import { ITranslationProvider } from './ITranslationProvider';
import { ITranslator } from './ITranslator';

@Service()
export class Translator implements ITranslator {
  constructor(private translationProvider: ITranslationProvider) {}

  init(): void {
    i18next.init({
      debug: false,
      lng: 'en_GB',
      resources: this.translationProvider.getResources() as Resource,
    });
  }

  changeLanguage(language: Locale = 'en_GB'): void {
    i18next.changeLanguage(language);
  }

  translate(text: string): string {
    return i18next.t(text, { content: text });
  }
}
