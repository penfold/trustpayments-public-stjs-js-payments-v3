import { APMValidator } from './APMValidator';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { anything, mock, when } from 'ts-mockito';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { RequestType } from '../../../../shared/types/RequestType';

describe('APMValidator', () => {
  let sut: APMValidator;
  let configProvider: ConfigProvider;
  let jwtDecoder: JwtDecoder;
  const configWithError: IAPMConfig = {
    placement: 'test-id',
    successRedirectUrl: 'successurl',
    errorRedirectUrl: 'errorurl',
    cancelRedirectUrl: 'cancelurl',
    apmList: [APMName.ZIP, 'testid' as APMName],
  };

  const config: IAPMConfig = {
    placement: 'test-id',
    successRedirectUrl: 'successurl',
    errorRedirectUrl: 'errorurl',
    cancelRedirectUrl: 'cancelurl',
    apmList: [
      APMName.ZIP,
    ],
  };

  const configFactory = (apmName: APMName, ...other) => ({
    ...other,
    name: apmName,
    successRedirectUrl: 'example.com',
    errorRedirectUrl: 'example.com',
    returnUrl: 'testurl',
    placement: 'st-apm',
  });

  beforeEach(() => {
    configProvider = mock<ConfigProvider>();
    jwtDecoder = mock(JwtDecoder);
    when(configProvider.getConfig()).thenReturn({ jwt: '' });
    sut = new APMValidator();
  });

  describe('validateConfig()', () => {

    it('should return given config and no error when its correct', () => {
      const returnedValue = sut.validateConfig(config);
      expect(returnedValue.error).toEqual(undefined);
      expect(returnedValue.value).toEqual(config);
    });

    it('should return an error when config is wrong', () => {
      const returnedValue = sut.validateConfig(configWithError);
      expect(returnedValue.value).toEqual(configWithError);
      expect(returnedValue.error.message).toEqual('"apmList[1]" does not match any of the allowed types');
    });
  });

  describe('validateItemConfig()', () => {

    it.each([
      [
        configFactory(APMName.ALIPAY), {
        'billingcountryiso2a': 'PL',
        'currencyiso3a': 'USD',
      }, null,
      ],
      [
        configFactory(APMName.ZIP), {
        'billingcountryiso2a': 'GB',
        'currencyiso3a': 'GBP',
      }, null,
      ],
    ])('should return an error when jwt fields are missing for any of APMs from apmList in config',
      (apmConfigList: IAPMItemConfig, jwt, error) => {
        when(jwtDecoder.decode(anything())).thenReturn({ payload: jwt });
        expect(sut.validateItemConfig(apmConfigList)).toEqual(error);
      });
  });

  describe('validateJwt', () => {
    it.each([
        [
          configFactory(APMName.ALIPAY), {
          billingcountryiso2a: 'PL',
          currencyiso3a: 'USD',
          orderreference: '123',
        },
          null,
        ],
        [
          configFactory(APMName.BITPAY), {
          billingcountryiso2a: 'PL',
          currencyiso3a: 'USD',
          orderreference: '123',
        },
          null,
        ],
        [
          configFactory(APMName.ZIP), {
          billingcountryiso2a: 'GB',
          currencyiso3a: 'GBP',
          accounttypedescription: 'test',
          baseamount: '1000',
          requesttypedescriptions: [RequestType.AUTH],
          sitereference: 'test',
          billingfirstname: 'test',
          billinglastname: 'test',
          billingpremise: 'test',
          billingstreet: 'test',
          billingtown: 'test',
          billingpostcode: 'test',
          billingcounty: 'test',
          billingemail: 'test',
        },
          null,
        ],

      ],
    )('should validate APM with schema from Joi', (config: IAPMItemConfig, payload: IStJwtPayload, error) => {
      expect(sut.validateJwt(config, payload)).toEqual(error);
    });
  });
});
