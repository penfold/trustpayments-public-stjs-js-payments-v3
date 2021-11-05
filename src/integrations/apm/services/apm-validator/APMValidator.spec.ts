import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { APMValidator } from './APMValidator';

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
