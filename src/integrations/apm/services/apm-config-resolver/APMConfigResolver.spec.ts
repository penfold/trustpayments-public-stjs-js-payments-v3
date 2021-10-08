import { APMConfigResolver } from './APMConfigResolver';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { APMValidator } from '../apm-validator/APMValidator';
import { anything, instance, mock, when } from 'ts-mockito';

describe('APMConfigResolver', () => {
  let aPMConfigResolver: APMConfigResolver;
  let aPMValidator: APMValidator;
  beforeEach(() => {
    aPMValidator = mock(APMValidator);
    when(aPMValidator.validate(anything())).thenReturn({ error: null, value: null });
    when(aPMValidator.validateAPMItemConfigs(anything())).thenReturn([]);
    aPMConfigResolver = new APMConfigResolver(instance(aPMValidator));
  });

  const testConfig: IAPMConfig = {
    cancelRedirectUrl: 'defaultCancelRedirectUrl',
    errorRedirectUrl: 'defaultErrorRedirectUrl',
    successRedirectUrl: 'defaultSuccessRedirectUrl',
    placement: 'st-apm',
    apmList: [
      APMName.ZIP,
      { name: APMName.ZIP },
      {
        name: APMName.ZIP,
        successRedirectUrl: 'customSuccessUrl1',
      },
      {
        name: APMName.ZIP,
        successRedirectUrl: 'customSuccessUrl1',
        errorRedirectUrl: 'customErrorUrl1',
        cancelRedirectUrl: 'customCancelUrl1',
        placement: 'custom-placement-id',
      },
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
          name: APMName.ZIP,
          cancelRedirectUrl: 'defaultCancelRedirectUrl',
          errorRedirectUrl: 'defaultErrorRedirectUrl',
          successRedirectUrl: 'customSuccessUrl1',
          placement: 'st-apm',
        },
        {
          name: APMName.ZIP,
          successRedirectUrl: 'customSuccessUrl1',
          errorRedirectUrl: 'customErrorUrl1',
          cancelRedirectUrl: 'customCancelUrl1',
          placement: 'custom-placement-id',
        },
      ],
  };

  it('should map apmList field to array of full configuration objects, assigning default values to fields not defined in item config', () => {
    expect(aPMConfigResolver.resolve(testConfig)).toEqual(expected);
  });
});