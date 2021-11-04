import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMCurrencyIso } from '../../models/APMCurrencyIso';
import { APMCountryIso } from '../../models/APMCountryIso';
import { RequestType } from '../../../../shared/types/RequestType';
import { APMPayloadFields } from '../../models/APMPayloadFields';

export const configFactory = (name: APMName, additional?: IAPMItemConfig): IAPMItemConfig => {
  return {
    ...additional,
    name,
    placement: 'st-testing-apm-area',
    successRedirectUrl: 'test-success-url',
    errorRedirectUrl: 'test-error-url',
  };
};

export const payloadFactory = (currrency: APMCurrencyIso, country: APMCountryIso, additional?: APMPayloadFields[]): IStJwtPayload => {
  return {
    ...additional,
    currencyiso3a: currrency,
    billingcountryiso2a: country,
  };
};

export const fullAPMList = [
  configFactory(APMName.ALIPAY),
  configFactory(APMName.BANCONTACT),
  configFactory(APMName.BITPAY),
  configFactory(APMName.EPS),
  configFactory(APMName.GIROPAY),
  configFactory(APMName.IDEAL),
  configFactory(APMName.MULTIBANCO),
  configFactory(APMName.MYBANK),
  configFactory(APMName.PAYU),
  configFactory(APMName.POSTFINANCE),
  configFactory(APMName.PRZELEWY24),
  configFactory(APMName.REDPAGOS),
  configFactory(APMName.SAFETYPAY),
  configFactory(APMName.SEPADD),
  configFactory(APMName.SOFORT),
  configFactory(APMName.TRUSTLY),
  configFactory(APMName.UNIONPAY),
  configFactory(APMName.WECHATPAY),
  configFactory(APMName.ZIP),
];


export const ZIPCorrectJwtPayload = {
  ...payloadFactory(APMCurrencyIso.GBP, APMCountryIso.GB, {
    // @ts-ignore
    billingfirstname: 'test',
    billinglastname: 'test',
    billingemail: 'test@test.pl',
    billingpremise: 'Premise',
    billingtown: 'Test',
    billingcounty: 'Test',
    orderreference: '123445',
    baseamount: '1000',
    customercountryiso2a: 'GB',
    billingstreet: 'test street',
    billingpostcode: 'PO1 3AX',
    accounttypedescription: 'TEST',
    sitereference: 'test_test',
    locale: 'en_GB',
    requesttypedescriptions: [RequestType.AUTH],
  }),
};
