import { getAPMListFromConfig } from './APMUtils';
import { IAPMConfig } from './IAPMConfig';
import { APMName } from './APMName';
import { IAPMItemConfig } from './IAPMItemConfig';

describe('getAPMListFromConfig', () => {
  const testConfig: IAPMConfig = {
    successRedirectUrl: 'defaultSuccessUrl',
    errorRedirectUrl: 'defaultErrorUrl',
    cancelRedirectUrl: 'defaultCancelRedirectUrl',
    placement: 'st-apm',
    apmList: [
      APMName.zip,
      {
        name: APMName.zip,
        errorRedirectUrl: 'customErrorUrl1',
        successRedirectUrl: 'customSuccessUrl1',
        cancelRedirectUrl: 'customCancelUrl1',
      },
      {
        name: APMName.zip,
      },
      {
        name: APMName.zip,
        errorRedirectUrl: 'customErrorUrl2',
      },
    ],
  };
  const expected: IAPMItemConfig[] = [
    {
      name: APMName.zip,
      errorRedirectUrl: testConfig.errorRedirectUrl,
      successRedirectUrl: testConfig.successRedirectUrl,
      cancelRedirectUrl: testConfig.cancelRedirectUrl,
    },
    {
      name: APMName.zip,
      errorRedirectUrl: 'customErrorUrl1',
      successRedirectUrl: 'customSuccessUrl1',
      cancelRedirectUrl: 'customCancelUrl1',
    },
    {
      name: APMName.zip,
    },
    {
      name: APMName.zip,
      errorRedirectUrl: 'customErrorUrl2',
    },
  ];

  it('should map atmList field to array of full configuration objects, assigning default fields if list item is only name', () => {
    expect(getAPMListFromConfig(testConfig)).toEqual(expected);
  });
});
