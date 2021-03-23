import i18next from 'i18next';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
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
import { Container } from 'typedi';
import { Locale } from './Locale';

export class Translator {
  private _storage: BrowserLocalStorage = Container.get(BrowserLocalStorage);

  constructor(locale: Locale) {
    i18next.init({
      debug: false,
      lng: locale,
      resources: {
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
      }
    });
  }

  public translate = (text: string) => {
    let json: Record<string, any>;

    try {
      const translations: string = this._storage.getItem('merchantTranslations');
      json = translations ? JSON.parse(translations) : {};
    } catch (e) {
      json = {};
    }

    const translation: string = Object.keys(json).includes(text) ? json[text] : '';
    return translation ? translation : i18next.t(text, { content: text });
  };

  changeLanguage(language: string): void {
    i18next.changeLanguage(language);
  }
}
