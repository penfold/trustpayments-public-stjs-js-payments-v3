import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { IAPMGatewayRequest } from '../../models/IAPMRequest';
import { APMRequestPayloadFactory } from './APMRequestPayloadFactory';

describe('APMRequestPayloadFactory', () => {
  const createTestConfig = (name: APMName): IAPMItemConfig => ({
    name,
    placement: 'st-apm',
    cancelRedirectUrl: 'cancelRedirectUrl',
    errorRedirectUrl: 'errorRedirectUrl',
    successRedirectUrl: 'successRedirectUrl',
    returnUrl: 'returnurl',
  });
  let subjectUnderTest: APMRequestPayloadFactory;

  beforeEach(() => {
    subjectUnderTest = new APMRequestPayloadFactory();
  });

  describe('create()', () => {
    it.each([
      [
        APMName.ZIP,
        {
          paymenttypedescription: APMName.ZIP,
          returnurl: 'returnurl',
        }],
      [
        APMName.ALIPAY,
        {
          paymenttypedescription: APMName.ALIPAY,
          returnurl: 'returnurl',
        },
      ],
      [
        APMName.ACCOUNT2ACCOUNT,
        {
          paymenttypedescription: APMName.ACCOUNT2ACCOUNT,
          returnurl: 'returnurl',
        },
      ],
    ])('for APMs with not-default payload structure should return request payload object based on APM name and config data - %s', (apmName:APMName, expected: IAPMGatewayRequest) => {
      const config = createTestConfig(apmName);
      expect(subjectUnderTest.create(config)).toEqual(expected);
    });

    it.each([
      APMName.BANCONTACT,
      APMName.BITPAY,
      APMName.EPS,
      APMName.GIROPAY,
      APMName.IDEAL,
      APMName.MULTIBANCO,
      APMName.MYBANK,
      APMName.PAYU,
      APMName.POSTFINANCE,
      APMName.PRZELEWY24,
      APMName.REDPAGOS,
      APMName.SAFETYPAY,
      APMName.SEPADD,
      APMName.SOFORT,
      APMName.TRUSTLY,
      APMName.UNIONPAY,
      APMName.WECHATPAY,
    ])('for APM with default payload structure it should return request payload mapped with default mapper from config object  - %s',
      (apmName: APMName) => {
        const config = createTestConfig(apmName);
        const expected = {
          paymenttypedescription: config.name,
          successfulurlredirect: config.successRedirectUrl,
          errorurlredirect: config.errorRedirectUrl,
        }
      expect(subjectUnderTest.create(config)).toEqual(expected);
    });
  });
});
