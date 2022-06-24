import { anyString, anything, instance, mock, when } from 'ts-mockito';
import Container from 'typedi';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../../../application/core/shared/translator/Translator';
import { ITranslationProvider } from '../../../../application/core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../../../application/core/shared/translator/TranslationProvider';
import { APMValidator } from '../apm-validator/APMValidator';
import { APMName } from '../../models/APMName';
import { IAPMConfig } from '../../models/IAPMConfig';
import { APMA2AButtonConfig } from '../../models/APMA2AButtonConfig';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';
import { APMConfigResolver } from './APMConfigResolver';

Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('APMConfigResolver', () => {
  let apmValidatorMock: APMValidator;
  let apmConfigResolver: APMConfigResolver;
  const testPlacement = 'st-apm';
  const customPlacement1 = 'custom-placement-id';
  const customPlacement2 = 'custom-placement-id';
  let translatorMock: ITranslator;

  beforeEach(() => {
    apmValidatorMock = mock(APMValidator);
    translatorMock = mock<ITranslator>();
    apmConfigResolver = new APMConfigResolver(instance(apmValidatorMock), instance(translatorMock));

    when(apmValidatorMock.validateConfig(anything())).thenReturn({ error: null, value: null });
    when(translatorMock.translate(anyString())).thenCall(value => value);
  });

  const testConfig: IAPMConfig = {
    placement: testPlacement,
    apmList: [
      APMName.PRZELEWY24,
      { name: APMName.PAYU },
      { name: APMName.WECHATPAY, placement: customPlacement1 },
      { name: APMName.ACCOUNT2ACCOUNT },
      { name: APMName.ACCOUNT2ACCOUNT, placement: customPlacement2 },
    ],
  };
  const expected: IAPMConfig = {
    ...testConfig,
    apmList: [
      {
        name: APMName.PRZELEWY24,
        placement: testPlacement,
      },
      {
        name: APMName.PAYU,
        placement: testPlacement,
      },
      {
        name: APMName.WECHATPAY,
        placement: customPlacement1,
      },
      {
        name: APMName.ACCOUNT2ACCOUNT,
        placement: testPlacement,
        button: {
          ...APMA2AButtonConfig,
        },
      },
      {
        name: APMName.ACCOUNT2ACCOUNT,
        placement: customPlacement2,
        button: {
          ...APMA2AButtonConfig,
        },
      },
    ],
  };

  it('should map apmList field to array of full configuration objects, assigning default values to fields not defined in item config', done => {
    apmConfigResolver.resolve(testConfig).subscribe((result: IAPMConfig) => {
      expect(result).toEqual(expected);
      done();
    });
  });
});
