import { Service } from 'typedi';

const localeCountryCodeMap = new Map()
  .set('de_DE', 'DE')
  .set('da_DK', 'DK')
  .set('en_GB', 'EN')
  .set('en_US', 'US')
  .set('es_ES', 'ES')
  .set('fr_FR', 'FR')
  .set('nl_NL', 'NL')
  .set('no_NO', 'NO');

@Service()
export class APMLocaleTransform {
  toCountryCode(locale: string) {
    return localeCountryCodeMap.get(locale);
  }
}
