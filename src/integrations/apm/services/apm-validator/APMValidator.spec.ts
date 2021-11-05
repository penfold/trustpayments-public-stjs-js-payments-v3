import { APMValidator } from './APMValidator';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { anything, instance, mock, when } from 'ts-mockito';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';

describe('APMValidator', () => {
  let sut: APMValidator;
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
    sut = new APMValidator();
  });

  describe('validate()', () => {

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
});
