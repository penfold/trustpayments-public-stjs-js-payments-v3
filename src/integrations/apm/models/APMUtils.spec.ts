import { getAPMListFromConfig } from './APMUtils';
import { IAPMConfig } from './IAPMConfig';
import { IAPMItemConfig } from './IAPMItemConfig';
import { APMName } from './APMName';

describe('getAPMListFromConfig', () => {
  const testConfig: IAPMConfig = {
    cancelRedirectUrl: 'defaultCancelRedirectUrl',
    errorRedirectUrl: 'defaultErrorRedirectUrl',
    successRedirectUrl: 'defaultSuccessRedirectUrl',
    placement: 'st-apm',
    apmList: [
      APMName.zip,
      { name: APMName.zip },
      {
        name: APMName.zip,
        successRedirectUrl: 'customSuccessUrl1',
      },
      {
        name: APMName.zip,
        successRedirectUrl: 'customSuccessUrl1',
        errorRedirectUrl: 'customErrorUrl1',
        cancelRedirectUrl: 'customCancelUrl1',
        placement: 'custom-placement-id',
      },
    ],
  };

  const expected: IAPMItemConfig[] = [
    {
      name: APMName.zip,
      cancelRedirectUrl: 'defaultCancelRedirectUrl',
      errorRedirectUrl: 'defaultErrorRedirectUrl',
      successRedirectUrl: 'defaultSuccessRedirectUrl',
      placement: 'st-apm',
    },
    {
      name: APMName.zip,
      cancelRedirectUrl: 'defaultCancelRedirectUrl',
      errorRedirectUrl: 'defaultErrorRedirectUrl',
      successRedirectUrl: 'defaultSuccessRedirectUrl',
      placement: 'st-apm',
    },
    {
      name: APMName.zip,
      cancelRedirectUrl: 'defaultCancelRedirectUrl',
      errorRedirectUrl: 'defaultErrorRedirectUrl',
      successRedirectUrl: 'customSuccessUrl1',
      placement: 'st-apm',
    },
    {
      name: APMName.zip,
      successRedirectUrl: 'customSuccessUrl1',
      errorRedirectUrl: 'customErrorUrl1',
      cancelRedirectUrl: 'customCancelUrl1',
      placement: 'custom-placement-id',
    },
  ];

  it('should map atmList field to array of full configuration objects, assigning default values to fields not defined in item config', () => {
    expect(getAPMListFromConfig(testConfig)).toEqual(expected);
  });
});
