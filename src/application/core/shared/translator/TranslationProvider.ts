import { Service } from 'typedi';
import cy_GB from '../../../../translations/json/cy_GB.json';
import da_DK from '../../../../translations/json/da_DK.json';
import de_DE from '../../../../translations/json/de_DE.json';
import en_GB from '../../../../translations/json/en_GB.json';
import en_US from '../../../../translations/json/en_US.json';
import es_ES from '../../../../translations/json/es_ES.json';
import fr_FR from '../../../../translations/json/fr_FR.json';
import it_IT from '../../../../translations/json/it_IT.json';
import nl_NL from '../../../../translations/json/nl_NL.json';
import no_NO from '../../../../translations/json/no_NO.json';
import sv_SE from '../../../../translations/json/sv_SE.json';
import { IResources } from '../../models/ITranslationResources';
import { ITranslationProvider } from './ITranslationProvider';

@Service()
export class TranslationProvider implements ITranslationProvider {
  private resources: IResources = {
    cy_GB: { translation: cy_GB },
    da_DK: { translation: da_DK },
    de_DE: { translation: de_DE },
    en_GB: { translation: en_GB },
    en_US: { translation: en_US },
    es_ES: { translation: es_ES },
    fr_FR: { translation: fr_FR },
    it_IT: { translation: it_IT },
    nl_NL: { translation: nl_NL },
    no_NO: { translation: no_NO },
    sv_SE: { translation: sv_SE },
  };

  getResources(): IResources {
    return this.resources;
  }
}
