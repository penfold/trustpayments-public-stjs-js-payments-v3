import { anything, instance, mock, when } from 'ts-mockito';
import Container from 'typedi';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMName } from '../../models/APMName';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../../../application/core/shared/translator/Translator';
import { ITranslationProvider } from '../../../../application/core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../../../application/core/shared/translator/TranslationProvider';
import { APMA2AButtonConfig } from '../../models/APMA2AButtonConfig';
import { APMValidator } from '../apm-validator/APMValidator';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';
import { APMConfigResolver } from './APMConfigResolver';

Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('APMConfigResolver', () => {
  let apmValidatorMock: APMValidator;
  let apmConfigResolver: APMConfigResolver;
  let translatorMock: ITranslator;

  beforeEach(() => {
    apmValidatorMock = mock(APMValidator);
    translatorMock = mock<ITranslator>();

    apmConfigResolver = new APMConfigResolver(instance(apmValidatorMock), instance(translatorMock));

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
    apmList: [
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

  it('should map apmList field to array of full configuration objects, overriding values provided in config', done => {

    const A2AbuttonConfigWithOverriding = {
      cancelRedirectUrl: 'defaultCancelRedirectUrl',
      errorRedirectUrl: 'defaultErrorRedirectUrl',
      successRedirectUrl: 'defaultSuccessRedirectUrl',
      placement: 'st-apm',
      apmList: [
        {
          name: APMName.ACCOUNT2ACCOUNT,
          returnUrl: 'returnurl',
          button: {
            height: '40px',
          },
        },
      ],
    };

    const A2AbuttonConfigWithOverridingAfterResolved = {
      cancelRedirectUrl: 'defaultCancelRedirectUrl',
      errorRedirectUrl: 'defaultErrorRedirectUrl',
      successRedirectUrl: 'defaultSuccessRedirectUrl',
      placement: 'st-apm',
      apmList: [
        {
          name: APMName.ACCOUNT2ACCOUNT,
          returnUrl: 'returnurl',
          placement: 'st-apm',
          cancelRedirectUrl: 'defaultCancelRedirectUrl',
          errorRedirectUrl: 'defaultErrorRedirectUrl',
          successRedirectUrl: 'defaultSuccessRedirectUrl',
          button: {
            ...APMA2AButtonConfig,
            height: '50px',
          },
        },
      ],
    };

    apmConfigResolver.resolve(A2AbuttonConfigWithOverriding).subscribe((result: IAPMConfig) => {
      expect(result).toEqual(A2AbuttonConfigWithOverridingAfterResolved);
    });
    done();
  });
});
