import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { APMRequestPayloadFactory } from './APMRequestPayloadFactory';

describe('APMRequestPayloadFactory', () => {
  const createTestConfig = (name: APMName): IAPMItemConfig => ({
    name,
    placement: 'st-apm',
  });

  let subjectUnderTest: APMRequestPayloadFactory;

  beforeEach(() => {
    subjectUnderTest = new APMRequestPayloadFactory();
  });

  describe('create()', () => {
    it.each([
      APMName.ZIP,
      APMName.ALIPAY,
      APMName.ACCOUNT2ACCOUNT,
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
    ])('should return requst payload mapped from provided config  - %s',
      (apmName: APMName) => {
        const config = createTestConfig(apmName);
        const expected = {
          paymenttypedescription: config.name,
        };
        expect(subjectUnderTest.create(config)).toEqual(expected);
      });
  });
});
