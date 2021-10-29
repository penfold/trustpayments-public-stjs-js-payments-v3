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
        createTestConfig(APMName.ZIP),
        {
          paymenttypedescription: APMName.ZIP,
          returnurl: 'returnurl',
        }],
      [
        createTestConfig(APMName.ALIPAY),
        {
          paymenttypedescription: APMName.ALIPAY,
          returnurl: 'returnurl',
        },
      ],
    ])('should return request payload object based on APM name and config data', (config: IAPMItemConfig, expected: IAPMGatewayRequest) => {
      expect(subjectUnderTest.create(config)).toEqual(expected);
    });
  });
});
