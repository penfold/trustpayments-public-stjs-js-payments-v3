import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { APMName } from './APMName';
import { APMCountryIso } from './APMCountryIso';
import { APMCurrencyIso } from './APMCurrencyIso';
import { APMPayloadFields } from './APMPayloadFields';

export const APMAvailabilityMap: Map<APMName, { countries: APMCountryIso[], currencies: APMCurrencyIso[], payload: IStJwtPayload[] }> = new Map()
  .set(APMName.ACCOUNT2ACCOUNT, {
    countries: [],
    currencies: [],
    payload: [APMPayloadFields.currencyiso3a, APMPayloadFields.orderreference],
  })
  .set(APMName.ALIPAY, {
    countries: [],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.CAD, APMCurrencyIso.CHF, APMCurrencyIso.DKK, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.HKD, APMCurrencyIso.JPY, APMCurrencyIso.KRW, APMCurrencyIso.NOK, APMCurrencyIso.NZD, APMCurrencyIso.SEK, APMCurrencyIso.SGD, APMCurrencyIso.THB, APMCurrencyIso.USD],
    payload: [APMPayloadFields.orderreference, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.BANCONTACT, {
    countries: [APMCountryIso.BE],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.BITPAY, {
    countries: [],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.USD],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.EPS, {
    countries: [APMCountryIso.AT],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.GIROPAY, {
    countries: [APMCountryIso.DE],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.IDEAL, {
    countries: [APMCountryIso.NL],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.MULTIBANCO, {
    countries: [APMCountryIso.PT],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.MYBANK, {
    countries: [APMCountryIso.IT],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set('PAYPAL' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.CAD, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.JPY, APMCurrencyIso.USD],
    payload: [],
  })
  .set('PAYSAFECARD' as APMName, {
    countries: [],
    currencies: [APMCurrencyIso.ARS, APMCurrencyIso.AUD, APMCurrencyIso.BGN, APMCurrencyIso.CAD, APMCurrencyIso.CHF, APMCurrencyIso, APMCurrencyIso.DKK, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.HRK, APMCurrencyIso.HUF, APMCurrencyIso.MXN, APMCurrencyIso.NOK, APMCurrencyIso.NZD, APMCurrencyIso.PEN, APMCurrencyIso.PLN, APMCurrencyIso.RON, APMCurrencyIso.SEK, APMCurrencyIso.TRY, APMCurrencyIso.USD, APMCurrencyIso.UYU],
    payload: [],
  })
  .set(APMName.PAYU, {
    countries: [APMCountryIso.CZ, APMCountryIso.PL],
    currencies: [APMCurrencyIso.CZK, APMCurrencyIso.PLN],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.POSTFINANCE, {
    countries: [APMCountryIso.CH],
    currencies: [APMCurrencyIso.CHF, APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.PRZELEWY24, {
    countries: [APMCountryIso.PL],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.PLN],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.billingemail, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.REDPAGOS, {
    countries: [APMCountryIso.UY],
    currencies: [APMCurrencyIso.USD],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.billingemail, APMPayloadFields.billingdob, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.SAFETYPAY, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CL, APMCountryIso.CO, APMCountryIso.CR, APMCountryIso.DE, APMCountryIso.EC, APMCountryIso.ES, APMCountryIso.MX, APMCountryIso.NL, APMCountryIso.PE, APMCountryIso.PR],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.USD],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.SEPADD, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CY, APMCountryIso.DE, APMCountryIso.EE, APMCountryIso.ES, APMCountryIso.FI, APMCountryIso.FR, APMCountryIso.GR, APMCountryIso.IE, APMCountryIso.IT, APMCountryIso.LT, APMCountryIso.LU, APMCountryIso.LV, APMCountryIso.MC, APMCountryIso.MT, APMCountryIso.NL, APMCountryIso.PT, APMCountryIso.SI, APMCountryIso.SK],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.billingemail, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.SOFORT, {
    countries: [APMCountryIso.AT, APMCountryIso.BE, APMCountryIso.CH, APMCountryIso.DE, APMCountryIso.ES, APMCountryIso.IT, APMCountryIso.NL, APMCountryIso.PL],
    currencies: [APMCurrencyIso.EUR],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.TRUSTLY, {
    countries: [APMCountryIso.DK, APMCountryIso.EE, APMCountryIso.ES, APMCountryIso.FI, APMCountryIso.IT, APMCountryIso.NO, APMCountryIso.PL, APMCountryIso.SE],
    currencies: [APMCurrencyIso.DKK, APMCurrencyIso.EUR, APMCurrencyIso.NOK, APMCurrencyIso.PLN, APMCurrencyIso.SEK],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.UNIONPAY, {
    countries: [],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.CAD, APMCurrencyIso.CHF, APMCurrencyIso.CNY, APMCurrencyIso.EUR, APMCurrencyIso.GBP, APMCurrencyIso.HKD, APMCurrencyIso.JPY, APMCurrencyIso.NZD, APMCurrencyIso.SGD, APMCurrencyIso.USD],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.WECHATPAY, {
    countries: [APMCountryIso.CN],
    currencies: [APMCurrencyIso.EUR, APMCurrencyIso.USD],
    payload: [APMPayloadFields.billingcountryiso2a, APMPayloadFields.currencyiso3a],
  })
  .set(APMName.ZIP, {
    countries: [APMCountryIso.AT, APMCountryIso.GB, APMCountryIso.NZ],
    currencies: [APMCurrencyIso.AUD, APMCurrencyIso.GBP, APMCurrencyIso.NZD],
    payload: [
      APMPayloadFields.accounttypedescription,
      APMPayloadFields.billingcountryiso2a,
      APMPayloadFields.billingcounty,
      APMPayloadFields.billingtown,
      APMPayloadFields.billingpostcode,
      APMPayloadFields.billingfirstname,
      APMPayloadFields.billinglastname,
      APMPayloadFields.billingpremise,
      APMPayloadFields.billingstreet,
      APMPayloadFields.billingemail,
      APMPayloadFields.currencyiso3a,
      APMPayloadFields.requesttypedescriptions,
      APMPayloadFields.sitereference,
    ],
  });
