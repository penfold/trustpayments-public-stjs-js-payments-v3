import { APMName } from './APMName';
import { APMCountryIso } from './APMCountryIso';
import { APMCurrencyIso } from './APMCurrencyIso';

export const APMAvailabilityMap: Map<APMName, { countries: string[], currencies: string[] }> = new Map()
  .set(APMName.ALIPAY, {
    countries: [],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.USD],
  })
  .set(APMName.BANCONTACT, {
    countries: [APMCountryIso.BE],
    currencies: [APMCurrencyIso.EUR],
  })
  .set(APMName.BITPAY, {
    countries: [],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.USD],
  })
  .set(APMName.EPS, {
    countries: [APMCountryIso.AT],
    currencies: [APMCurrencyIso.EUR],
  })
  .set(APMName.GIROPAY, {
    countries: [APMCountryIso.DE],
    currencies: [APMCurrencyIso.EUR],
  })
  .set(APMName.IDEAL, {
    countries: [APMCountryIso.NL],
    currencies: [APMCurrencyIso.EUR],
  })
  .set(APMName.MULTIBANCO, {
    countries: [APMCountryIso.PT],
    currencies: [APMCurrencyIso.EUR],
  })
  .set(APMName.MYBANK, {
    countries: [APMCountryIso.IT],
    currencies: [APMCurrencyIso.EUR],
  })
  .set('PAYPAL' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.CAD, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.JPY, APMCurrencyIso.USD],
  })
  .set('PAYSAFECARD' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.ARS, APMCurrencyIso.AUD, APMCurrencyIso.BGN, APMCurrencyIso.CAD, APMCurrencyIso.CHF, APMCurrencyIso, APMCurrencyIso.DKK, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.HRK, APMCurrencyIso.HUF, APMCurrencyIso.MXN, APMCurrencyIso.NOK, APMCurrencyIso.NZD, APMCurrencyIso.PEN, APMCurrencyIso.PLN, APMCurrencyIso.RON, APMCurrencyIso.SEK, APMCurrencyIso.TRY, APMCurrencyIso.USD, APMCurrencyIso.UYU],
  })
  .set(APMName.PAYU, {
    countries: [APMCountryIso.CZ, APMCountryIso.PL],
    currencies: [APMCurrencyIso.CZK, APMCurrencyIso.PLN],
  })
  .set(APMName.POSTFINANCE, {
    countries: [APMCountryIso.CH],
    currencies: [APMCurrencyIso.CHF, APMCurrencyIso.EUR],
  })
  .set(APMName.PRZELEWY24, {
    countries: [APMCountryIso.PL],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.PLN],
  })
  .set(APMName.REDPAGOS, {
    countries: [APMCountryIso.UY],
    currencies: [APMCurrencyIso.USD],
  })
  .set(APMName.SAFETYPAY, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CL, APMCountryIso.CO, APMCountryIso.CR, APMCountryIso.DE, APMCountryIso.EC, APMCountryIso.ES, APMCountryIso.MX, APMCountryIso.NL, APMCountryIso.PE, APMCountryIso.PR],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.USD],
  })
  .set(APMName.SEPADD, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CY, APMCountryIso.DE, APMCountryIso.EE, APMCountryIso.ES, APMCountryIso.FI, APMCountryIso.FR, APMCountryIso.GR, APMCountryIso.IE, APMCountryIso.IT, APMCountryIso.LT, APMCountryIso.LU, APMCountryIso.LV, APMCountryIso.MC, APMCountryIso.MT, APMCountryIso.NL, APMCountryIso.PT, APMCountryIso.SI, APMCountryIso.SK],
    currencies: [APMCurrencyIso.EUR],
  })
  .set(APMName.SOFORT, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CH, APMCountryIso.DE, APMCountryIso.ES, APMCountryIso.IT, APMCountryIso.NL, APMCountryIso.PL],
    currencies: [APMCurrencyIso.EUR],
  })
  .set(APMName.TRUSTLY, {
    countries: [APMCountryIso.DK, APMCountryIso.EE, APMCountryIso.ES, APMCountryIso.FI, APMCountryIso.IT, APMCountryIso.NO, APMCountryIso.PL, APMCountryIso.SE],
    currencies: [APMCurrencyIso.DKK, APMCurrencyIso.EUR, APMCurrencyIso.NOK, APMCurrencyIso.PLN, APMCurrencyIso.SEK],
  })
  .set(APMName.UNIONPAY, {
    countries: [],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.CAD, APMCurrencyIso.CHF, APMCurrencyIso.CNY, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.HKD, APMCurrencyIso.JPY, APMCurrencyIso.NZD, APMCurrencyIso.SGD, APMCurrencyIso.USD],
  })
  .set(APMName.WECHATPAY, {
    countries: [APMCountryIso.CN],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.USD],
  })
  .set(APMName.ZIP, {
    countries: [APMCountryIso.AT, APMCountryIso.GB, APMCountryIso.NZ],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.GBP, APMCurrencyIso.NZD],
  });
