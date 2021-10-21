import { APMName } from './APMName';

export const APMAvailabilityMap: Map<APMName, { countries: string[], currencies: string[] }> = new Map()
  .set('ALIPAY' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('BANCONTACT' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('EPS' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('GIROPAY' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('IDEAL' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('MULTIBANCO' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('MYBANK' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('PAYPAL' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('PAYSAFECARD' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('PAYU' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('POSTFINANCE' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('PRZELEWY24' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('QIWI' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('REDPAGOS' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('SAFETYPAY' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('SEPADD' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('SOFORT' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('TRUSTLY' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('UNIONPAY' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set('WECHATPAY' as APMName, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  })
  .set(APMName.ZIP, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'EN', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  });






