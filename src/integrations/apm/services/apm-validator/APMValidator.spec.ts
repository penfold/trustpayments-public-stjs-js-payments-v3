import { anyOfClass, instance, mock, verify } from 'ts-mockito';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { RequestType } from '../../../../shared/types/RequestType';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { MisconfigurationError } from '../../../../shared/services/sentry/MisconfigurationError';
import { APMValidator } from './APMValidator';

describe('APMValidator', () => {
  let sut: APMValidator;
  let sentryServiceMock: SentryService;
  const configWithError: IAPMConfig = {
    placement: 'test-id',
    apmList: [APMName.ZIP, 'testid' as APMName],
  };

  const config: IAPMConfig = {
    placement: 'test-id',
    apmList: [
      APMName.ZIP,
    ],
  };

  const configFactory = (apmName: APMName, ...other) => ({
    ...other,
    name: apmName,
    placement: 'st-apm',
  });

  beforeEach(() => {
    sentryServiceMock = mock(SentryService);
    sut = new APMValidator(instance(sentryServiceMock));
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

    describe('when validation returns warning about deprecated fields', () => {
      const warningMessage = '"successRedirectUrl" is no longer supported in APM config. Redirect urls for APMs should be set in JWT and not in APM config' +
        '. "errorRedirectUrl" is no longer supported in APM config. Redirect urls for APMs should be set in JWT and not in APM config' +
        '. "cancelRedirectUrl" is no longer supported in APM config. Redirect urls for APMs should be set in JWT and not in APM config';
      const testConfig = {
        placement: 'st-apm',
        apmList: [],
        successRedirectUrl: 'successUrl',
        errorRedirectUrl: 'errorUrl',
        cancelRedirectUrl: 'cancelUrl',
      } as unknown as IAPMConfig;

      it('should display console warnign with warning message', () => {
        console.warn = jest.fn();
        sut.validateConfig(testConfig);

        expect(console.warn).toHaveBeenCalledWith(warningMessage);
      });

      it('should report it sentry misconfiguration error', () => {
        console.warn = jest.fn();
        sut.validateConfig(testConfig);

        verify(sentryServiceMock.sendCustomMessage(anyOfClass(MisconfigurationError))).once();
      });
    });

    describe('validateItemConfig()', () => {
      it.each([
        [configFactory(APMName.ALIPAY), null],
        [configFactory(APMName.ZIP), null],
      ])('should return an error when jwt fields are missing for any of APMs from apmList in config',
        (apmConfigList: IAPMItemConfig, error) => {
          expect(sut.validateItemConfig(apmConfigList)).toEqual(error);
        });

      describe
        .each([
          [{
            name: APMName.ZIP,
            returnUrl: 'returnurl',
            placement: 'st-apm',
          } as unknown as IAPMItemConfig, 'returnUrl'],
          [{
            name: APMName.ALIPAY,
            returnUrl: 'returnurl',
            placement: 'st-apm',
          } as unknown as IAPMItemConfig, 'returnUrl'],
          [{
            name: APMName.ACCOUNT2ACCOUNT,
            returnUrl: 'returnurl',
            placement: 'st-apm',
          } as unknown as IAPMItemConfig, 'returnUrl'],
          [{
            name: APMName.PAYU,
            successRedirectUrl: 'returnurl',
            placement: 'st-apm',
          } as unknown as IAPMItemConfig, 'successRedirectUrl'],
          [{
            name: APMName.PRZELEWY24,
            errorRedirectUrl: 'returnurl',
            placement: 'st-apm',
          } as unknown as IAPMItemConfig, 'errorRedirectUrl'],

        ] as [IAPMItemConfig, string][])('when validation returns warning about deprecated fields',
          (config, deprecatedField) => {
            beforeEach(() => {
              console.warn = jest.fn();
            });

            it(`for ${config.name} should print warning using console`, () => {
              const warningMessage = `"${deprecatedField}" is no longer supported in ${config.name} APM config. Redirect urls for APMs should be set in JWT and not in APM config`;
              sut.validateItemConfig(config);
              expect(console.warn).toHaveBeenCalledWith(warningMessage);
            });

            it('should report it as a MisconfigurationError to Sentry', () => {
              sut.validateItemConfig(config);
              verify(sentryServiceMock.sendCustomMessage(anyOfClass(MisconfigurationError))).once();
            });
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
            '"returnurl" is required',
          ],
          [
            configFactory(APMName.BITPAY), {
            billingcountryiso2a: 'PL',
            currencyiso3a: 'USD',
            orderreference: '123',
          },
            '"successfulurlredirect" is required',
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
            '"returnurl" is required',
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
            returnurl: 'url',
          },
            null,
          ],

        ] as [IAPMItemConfig, IStJwtPayload, string | null][]
      )('should validate JWT with schema from Joi', (config: IAPMItemConfig, payload: IStJwtPayload, expectedError) => {
        if (expectedError === null) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(sut.validateJwt(config, payload)).toEqual(expectedError);
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(sut.validateJwt(config, payload).message).toEqual(expectedError);
        }

      });
    });
  });
});
