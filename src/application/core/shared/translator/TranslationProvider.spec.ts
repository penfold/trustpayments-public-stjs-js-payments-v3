import { Container } from 'typedi';
import * as translations from '../../models/constants/Translations';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import en_GB from '../../../../translations/json/en_GB.json';
import cy_GB from './../../../../translations/json/cy_GB.json';
import da_DK from './../../../../translations/json/da_DK.json';
import de_DE from './../../../../translations/json/de_DE.json';
import en_US from './../../../../translations/json/en_US.json';
import es_ES from './../../../../translations/json/es_ES.json';
import fr_FR from './../../../../translations/json/fr_FR.json';
import nl_NL from './../../../../translations/json/nl_NL.json';
import no_NO from './../../../../translations/json/no_NO.json';
import sv_SE from './../../../../translations/json/sv_SE.json';
import { TranslationProvider } from './TranslationProvider';
import { Translator } from './Translator';
import { ITranslationProvider } from './ITranslationProvider';

Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

const translationItems = { translations };

describe('TranslationProvider', () => {
  describe('getResources()', () => {
    let translationProvider: TranslationProvider;
    let translations: Array<Record<string, string>>;

    beforeEach(() => {
      translationProvider = Container.get(TranslationProvider);
      translations = [en_GB, cy_GB, da_DK, de_DE, en_US, es_ES, fr_FR, nl_NL, no_NO, sv_SE];
    });

    it('should have translations for all Language parameters', () => {
      for (const i in translations) {
        const translation: Record<string, string> = translations[i];
        const language: { translations: Record<string, string> } = translationItems;
        for (const key in language.translations) {
          const text = language.translations[key];
          expect(translation[text]).toBeDefined();
        }
      }
    });

    it('should return translations with at least one language', () => {
      expect(translationProvider.getResources()).toHaveProperty('en_GB');
    });
  });
});
