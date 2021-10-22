import { APMName } from './APMName';
import { APMCountryIso } from './APMCountryIso';
import { APMCurrencyIso } from './APMCurrencyIso';

export const APMAvailabilityMap: Map<APMName, { countries: string[], currencies: string[] }> = new Map()
  .set('ALIPAY' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.USD],
  })
  .set('BANCONTACT' as APMName, {
    countries: [APMCountryIso.BE],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('BITPAY' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.USD],
  })
  .set('EPS' as APMName, {
    countries: [APMCountryIso.AT],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('GIROPAY' as APMName, {
    countries: [APMCountryIso.DE],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('IDEAL' as APMName, {
    countries: [APMCountryIso.NL],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('MULTIBANCO' as APMName, {
    countries: [APMCountryIso.PT],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('MYBANK' as APMName, {
    countries: [APMCountryIso.IT],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('PAYPAL' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.CAD, APMCurrencyIso.EUR, APMCurrencyIso.GBP, 'JPY', APMCurrencyIso.USD],
  })
  .set('PAYSAFECARD' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.ARS, APMCurrencyIso.AUD, APMCurrencyIso.BGN, APMCurrencyIso.CAD, APMCurrencyIso.CHF, APMCurrencyIso, APMCurrencyIso.DKK, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.HRK, APMCurrencyIso.HUF, APMCurrencyIso.MXN, APMCurrencyIso.NOK, APMCurrencyIso.NZD, APMCurrencyIso.PEN, APMCurrencyIso.PLN, APMCurrencyIso.RON, APMCurrencyIso.SEK, APMCurrencyIso.TRY, APMCurrencyIso.USD, APMCurrencyIso.UYU],
  })
  .set('PAYU' as APMName, {
    countries: [APMCountryIso.CZ, APMCountryIso.PL],
    currencies: [APMCurrencyIso.CZK, APMCurrencyIso.PLN],
  })
  .set('POSTFINANCE' as APMName, {
    countries: [APMCountryIso.CH],
    currencies: [APMCurrencyIso.CHF, APMCurrencyIso.EUR],
  })
  .set('PRZELEWY24' as APMName, {
    countries: [APMCountryIso.PL],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.PLN],
  })
  .set('REDPAGOS' as APMName, {
    countries: [APMCountryIso.UY],
    currencies: [APMCurrencyIso.USD],
  })
  .set('SAFETYPAY' as APMName, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CL, APMCountryIso.CO, APMCountryIso.CR, APMCountryIso.DE, APMCountryIso.EC, APMCountryIso.ES, APMCountryIso.MX, APMCountryIso.NL, APMCountryIso.PE, APMCountryIso.PR],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.USD],
  })
  .set('SEPADD' as APMName, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CY, APMCountryIso.DE, APMCountryIso.EE, APMCountryIso.ES, APMCountryIso.FI, APMCountryIso.FR, APMCountryIso.GR, APMCountryIso.IE, APMCountryIso.IT, APMCountryIso.LT, APMCountryIso.LU, APMCountryIso.LV, APMCountryIso.MC, APMCountryIso.MT, APMCountryIso.NL, APMCountryIso.PT, APMCountryIso.SI, APMCountryIso.SK],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('SOFORT' as APMName, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CH, APMCountryIso.DE, APMCountryIso.ES, APMCountryIso.IT, APMCountryIso.NL, APMCountryIso.PL],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('TRUSTLY' as APMName, {
    countries: [APMCountryIso.DK, APMCountryIso.EE, APMCountryIso.ES, APMCountryIso.FI, APMCountryIso.IT, APMCountryIso.NO, APMCountryIso.PL, APMCountryIso.SE],
    currencies: ['DKK', APMCurrencyIso.EUR, APMCurrencyIso.NOK, APMCurrencyIso.PLN, APMCurrencyIso.SEK],
  })
  .set('UNIONPAY' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.CAD, APMCurrencyIso.CHF, APMCurrencyIso.CNY, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.HKD, APMCurrencyIso.JPY, APMCurrencyIso.NZD, APMCurrencyIso.SGD, APMCurrencyIso.USD],
  })
  .set('WECHATPAY' as APMName, {
    countries: [APMCountryIso.CN],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.USD],
  })
  .set(APMName.ZIP, {
    countries: [APMCountryIso.AT, APMCountryIso.GB, APMCountryIso.NZ],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.GBP, APMCurrencyIso.NZD],
  });
