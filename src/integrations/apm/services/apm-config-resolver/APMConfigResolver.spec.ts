import { anything, instance, mock, when } from 'ts-mockito';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { APMA2AButtonConfig } from '../../models/APMA2AButtonConfig';
import { APMValidator } from '../apm-validator/APMValidator';
import { APMConfigResolver } from './APMConfigResolver';

describe('APMConfigResolver', () => {
  let apmValidatorMock: APMValidator;
  let apmConfigResolver: APMConfigResolver;

  beforeEach(() => {
    apmValidatorMock = mock(APMValidator);
    apmConfigResolver = new APMConfigResolver(instance(apmValidatorMock));

    when(apmValidatorMock.validateConfig(anything())).thenReturn({ error: null, value: null });
  });

  const testConfig: IAPMConfig = {
    cancelRedirectUrl: 'defaultCancelRedirectUrl',
    errorRedirectUrl: 'defaultErrorRedirectUrl',
    successRedirectUrl: 'defaultSuccessRedirectUrl',
    placement: 'st-apm',
    apmList: [
      APMName.ZIP,
      { name: APMName.ZIP },
      { name: APMName.ALIPAY, returnUrl: 'returnurl' },
      {
        name: APMName.ZIP,
        successRedirectUrl: 'customSuccessUrl1',
      },
      {
        name: APMName.ZIP,
        successRedirectUrl: 'customSuccessUrl2',
        errorRedirectUrl: 'customErrorUrl1',
        cancelRedirectUrl: 'customCancelUrl1',
        placement: 'custom-placement-id',
      },
      { name: APMName.ACCOUNT2ACCOUNT, returnUrl: 'returnurl' },
    ],
  };

  const expected: IAPMConfig = {
    ...testConfig,
    apmList:
      [
        {
          name: APMName.ZIP,
          cancelRedirectUrl: 'defaultCancelRedirectUrl',
          errorRedirectUrl: 'defaultErrorRedirectUrl',
          successRedirectUrl: 'defaultSuccessRedirectUrl',
          placement: 'st-apm',
        },
        {
          name: APMName.ZIP,
          cancelRedirectUrl: 'defaultCancelRedirectUrl',
          errorRedirectUrl: 'defaultErrorRedirectUrl',
          successRedirectUrl: 'defaultSuccessRedirectUrl',
          placement: 'st-apm',
        },
        {
          name: APMName.ALIPAY,
          returnUrl: 'returnurl',
          placement: 'st-apm',
          cancelRedirectUrl: 'defaultCancelRedirectUrl',
          errorRedirectUrl: 'defaultErrorRedirectUrl',
          successRedirectUrl: 'defaultSuccessRedirectUrl',
        },
        {
          name: APMName.ZIP,
          cancelRedirectUrl: 'defaultCancelRedirectUrl',
          errorRedirectUrl: 'defaultErrorRedirectUrl',
          successRedirectUrl: 'customSuccessUrl1',
          placement: 'st-apm',
        },
        {
          name: APMName.ZIP,
          successRedirectUrl: 'customSuccessUrl2',
          errorRedirectUrl: 'customErrorUrl1',
          cancelRedirectUrl: 'customCancelUrl1',
          placement: 'custom-placement-id',
        },
        {
          name: APMName.ACCOUNT2ACCOUNT,
          returnUrl: 'returnurl',
          placement: 'st-apm',
          cancelRedirectUrl: 'defaultCancelRedirectUrl',
          errorRedirectUrl: 'defaultErrorRedirectUrl',
          successRedirectUrl: 'defaultSuccessRedirectUrl',
          button: {
            ...APMA2AButtonConfig,
          },
        },
      ],
  };

  it('should map apmList field to array of full configuration objects, assigning default values to fields not defined in item config', done => {
    apmConfigResolver.resolve(testConfig).subscribe((result: IAPMConfig) => {
      expect(result).toEqual(expected);
    });
    done();
  });
});
