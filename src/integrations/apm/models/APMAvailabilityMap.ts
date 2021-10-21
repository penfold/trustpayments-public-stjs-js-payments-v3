import { APMName } from './APMName';

export const APMAvailabilityMap: Map<APMName, { countries: string[], currencies: string[] }> = new Map()
  .set('ALIPAY' as APMName, {
    countries: [],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('BANCONTACT' as APMName, {
    countries: ['BE'],
    currencies: ['EUR'],
  })
  .set('BITPAY' as APMName, {
    countries: [],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('EPS' as APMName, {
    countries: ['AT'],
    currencies: ['EUR'],
  })
  .set('GIROPAY' as APMName, {
    countries: ['DE'],
    currencies: ['EUR'],
  })
  .set('IDEAL' as APMName, {
    countries: ['NL'],
    currencies: ['EUR'],
  })
  .set('MULTIBANCO' as APMName, {
    countries: ['PT'],
    currencies: ['EUR'],
  })
  .set('MYBANK' as APMName, {
    countries: ['IT'],
    currencies: ['EUR'],
  })
  .set('PAYPAL' as APMName, {
    countries: [],
    currencies: ['AUD', 'CAD', 'EUR', 'GBP', 'JPY', 'USD'],
  })
  .set('PAYSAFECARD' as APMName, {
    countries: [],
    currencies: ['ARS', 'AUD', 'BGN', 'CAD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP', 'HRK', 'HUF', 'MXN', 'NOK', 'NZD', 'PEN', 'PLN', 'RON', 'SEK', 'TRY', 'USD', 'UYU'],
  })
  .set('PAYU' as APMName, {
    countries: ['CZ', 'PL'],
    currencies: ['CZK', 'PLN'],
  })
  .set('POSTFINANCE' as APMName, {
    countries: ['CH'],
    currencies: ['CHF', 'EUR'],
  })
  .set('PRZELEWY24' as APMName, {
    countries: ['PL'],
    currencies: ['EUR', 'PLN'],
  })
  .set('REDPAGOS' as APMName, {
    countries: ['UY'],
    currencies: ['USD'],
  })
  .set('SAFETYPAY' as APMName, {
    countries: ['AT', 'BE', 'CL', 'CO', 'CR', 'DE', 'EC', 'ES', 'MX', 'NL', 'PE', 'PR'],
    currencies: ['EUR', 'USD'],
  })
  .set('SEPADD' as APMName, {
    countries: ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MC', 'MT', 'NL', 'PT', 'SI', 'SK'],
    currencies: ['EUR'],
  })
  .set('SOFORT' as APMName, {
    countries: ['AT', 'BE', 'CH', 'DE', 'ES', 'IT', 'NL', 'PL'],
    currencies: ['EUR'],
  })
  .set('TRUSTLY' as APMName, {
    countries: ['DK', 'EE', 'ES', 'FI', 'IT', 'NO', 'PL', 'SE'],
    currencies: ['DKK', 'EUR', 'NOK', 'PLN', 'SEK'],
  })
  .set('UNIONPAY' as APMName, {
    countries: [],
    currencies: ['AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD', 'JPY', 'NZD', 'SGD', 'USD'],
  })
  .set('WECHATPAY' as APMName, {
    countries: ['CN'],
    currencies: ['EUR', 'USD'],
  })
  .set(APMName.ZIP, {
    countries: ['AT', 'GB', 'NZ'],
    currencies: ['AUD', 'GBP', 'NZD'],
  });






