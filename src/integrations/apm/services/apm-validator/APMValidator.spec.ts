import { APMValidator } from './APMValidator';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { anything, instance, mock, when } from 'ts-mockito';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { StoreConfigProvider } from '../../../../application/core/services/store-config-provider/StoreConfigProvider';

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

  beforeEach(() => {
    configProvider = mock(StoreConfigProvider);
    jwtDecoder = mock(JwtDecoder);
    when(configProvider.getConfig()).thenReturn({ jwt: '' });
    sut = new APMValidator(instance(jwtDecoder), instance(configProvider));
  });

  describe('validate()', () => {

    it('should return given config and no error when its correct', () => {
      const returnedValue = sut.validate(config);
      expect(returnedValue.error).toEqual(undefined);
      expect(returnedValue.value).toEqual(config);
    });

    it('should return an error when config is wrong', () => {
      const returnedValue = sut.validate(configWithError);
      expect(returnedValue.value).toEqual(configWithError);
      expect(returnedValue.error.message).toEqual('"apmList[1]" does not match any of the allowed types');
    });
  });

  describe('validateAPMItemConfigs()', () => {
    const configFactory = (apmName: APMName) => ({
      name: apmName,
      successRedirectUrl: 'example.com',
      errorRedirectUrl: 'example.com',
      placement: 'st-apm' ,
    });

    it.each([
      [[configFactory(APMName.WECHATPAY)] as IAPMItemConfig[], { 'billingcountryiso2a': 'PL' }, '"currencyiso3a" is required'],
      [[configFactory(APMName.WECHATPAY), configFactory(APMName.PRZELEWY24)] as IAPMItemConfig[], {
        'billingcountryiso2a': 'PL',
        'currencyiso3a': 'USD',
      }, '"billingemail" is required'],
      [[configFactory(APMName.ALIPAY), configFactory(APMName.PRZELEWY24 )] as IAPMItemConfig[], {
        'billingcountryiso2a': 'PL',
        'currencyiso3a': 'USD',
      }, '"orderreference" is required'],
    ])('should return an error when jwt fields are missing for any of APMs from apmList in config',
      (apmConfigList: IAPMItemConfig[], jwt, expectedError: string) => {
        when(jwtDecoder.decode(anything())).thenReturn({ payload: jwt });
        expect(sut.validateAPMItemConfigs(apmConfigList)[0]?.message).toEqual(expectedError);
      });
  });
});
