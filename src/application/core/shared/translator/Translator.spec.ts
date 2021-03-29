import { mock, instance, when } from 'ts-mockito';
import Container from 'typedi';
import { Translator } from './Translator';
import { TranslationProvider } from './TranslationProvider';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ITranslationProvider } from './ITranslationProvider';
import cy_GB from '../../../../translations/json/cy_GB.json';
import da_DK from '../../../../translations/json/da_DK.json';
import de_DE from '../../../../translations/json/de_DE.json';
import en_GB from '../../../../translations/json/en_GB.json';
import en_US from '../../../../translations/json/en_US.json';
import es_ES from '../../../../translations/json/es_ES.json';
import fr_FR from '../../../../translations/json/fr_FR.json';
import nl_NL from '../../../../translations/json/nl_NL.json';
import no_NO from '../../../../translations/json/no_NO.json';
import sv_SE from '../../../../translations/json/sv_SE.json';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../../../../testing/mocks/TestConfigProvider';
import i18next, { Resource } from 'i18next';

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('Translator', () => {
  const resources = {
    cy_GB: { translation: cy_GB },
    da_DK: { translation: da_DK },
    de_DE: { translation: de_DE },
    en_GB: { translation: en_GB },
    en_US: { translation: en_US },
    es_ES: { translation: es_ES },
    fr_FR: { translation: fr_FR },
    nl_NL: { translation: nl_NL },
    no_NO: { translation: no_NO },
    sv_SE: { translation: sv_SE }
  };

  describe('changeLanguage()', () => {
    let translator: Translator;
    let translationProvider: TranslationProvider;

    beforeEach(() => {
      Container.get(TranslatorToken).init();
      translationProvider = mock(TranslationProvider);
      when(translationProvider.getResources()).thenReturn(resources);
      translator = new Translator(instance(translationProvider));
    });

    it('should leave english unchanged', () => {
      expect(translator.translate('Field is required')).toBe('Field is required');
      expect(translator.translate('Ok')).toBe('Payment has been successfully processed'); // Special case for success message
    });

    it('should translate phrase to french', () => {
      translator.changeLanguage('fr_FR');
      expect(translator.translate('Field is required')).toBe('Champ requis');
      expect(translator.translate('Ok')).toBe('Le paiement a été traité avec succès');
    });

    it('should translate phrase to german', () => {
      translator.changeLanguage('de_DE');
      expect(translator.translate('Field is required')).toBe('Feld ist erforderlich');
      expect(translator.translate('Ok')).toBe('Zahlung wurde erfolgreich verarbeitet');
    });
  });

  describe('translate()', () => {
    let translator: Translator;
    let translationProvider: TranslationProvider;
    const missingTranslation = 'Some missing translation';

    beforeEach(() => {
      Container.get(TranslatorToken).init();
      translationProvider = mock(TranslationProvider);
      when(translationProvider.getResources()).thenReturn(resources);
      translator = new Translator(instance(translationProvider));
      translator.changeLanguage('en_GB');
    });

    it('should return translated phrase', () => {
      expect(translator.translate('Ok')).toBe('Payment has been successfully processed');
    });

    it('should return unchanged phrase if translation is missing', () => {
      expect(translator.translate(missingTranslation)).toBe(missingTranslation);
    });
  });
});
