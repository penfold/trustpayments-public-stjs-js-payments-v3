import { Service } from 'typedi';
import { Locale } from './Locale';

@Service()
export abstract class ITranslator {
  abstract changeLanguage(language: Locale): void;
  abstract translate(text: string): string;
  abstract init(): void;
}
