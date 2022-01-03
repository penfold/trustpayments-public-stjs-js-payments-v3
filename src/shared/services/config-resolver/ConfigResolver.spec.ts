import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { ContainerInstance } from 'typedi';
import { ValidationResult } from 'joi';
import { ConfigValidator } from '../config-validator/ConfigValidator';
import { SentryService } from '../sentry/SentryService';
import { MisconfigurationError } from '../sentry/MisconfigurationError';
import {
  config,
  configResolved,
  minimalConfig,
  minimalDefaultConfigResolve,
} from './ConfigResolverTestData';
import { ConfigResolver } from './ConfigResolver';

describe('ConfigResolver', () => {
  let sut: ConfigResolver;
  let configValidatorMock: ConfigValidator;
  let containerInstanceMock: ContainerInstance;
  let sentryServiceMock: SentryService;

  beforeEach(() => {
    configValidatorMock = mock(ConfigValidator);
    containerInstanceMock = mock(ContainerInstance);
    sentryServiceMock = mock(SentryService);
    sut = new ConfigResolver(
      instance(configValidatorMock),
      instance(containerInstanceMock),
    );

    when(configValidatorMock.validate(anything())).thenReturn({ error: undefined, value: null });
    when(containerInstanceMock.get(SentryService)).thenReturn(instance(sentryServiceMock));
  });

  it('should set default config-provider when some of properties are not set', () => {
    expect(sut.resolve(config)).toEqual(configResolved);
  });

  it('should set default config-provider when all of the properties are not set, except of those which are obligatory', () => {
    expect(sut.resolve(minimalConfig)).toEqual(minimalDefaultConfigResolve);
  });

  it('should set config-provider with given values if they are correct', () => {
    expect(sut.resolve(minimalDefaultConfigResolve)).toEqual(minimalDefaultConfigResolve);
  });

  it('should throw an error when set config is not valid', () => {
    when(configValidatorMock.validate(anything())).thenReturn({
      value: 'Some descriptive error',
      error: { message: 'Some descriptive error', ...anything() },
    });
    expect(() => sut.resolve({ jwt: '' })).toThrow(new Error('Some descriptive error'));
  });

  it('should pass error to sentry', () => {
    when(configValidatorMock.validate(anything())).thenReturn({
      value: 'Some descriptive error',
      error: { message: 'Some descriptive error', ...anything() },
    });
    expect(() => sut.resolve({ jwt: '' })).toThrow(new Error('Some descriptive error'));
    verify(
      sentryServiceMock.sendCustomMessage(
        deepEqual(new MisconfigurationError('Misconfiguration: Some descriptive error', new Error('Some descriptive error')))
      )
    ).once();
  });

  it('should pass message to sentry if datacenterurl property is incorrect', () => {
    when(configValidatorMock.validate(anything())).thenReturn({
      value: 'Deprecation message',
      warning: { details: [{ message: 'deprecation message', path: ['datacenterurl'], type: 'deprecate.error', context: { key: 'datacenterurl', value: 'tester' } }] },
      error: undefined,
    } as ValidationResult);
    const error = new Error('Invalid datacenterurl config value: tester');
    sut.resolve(config);
    verify(
      sentryServiceMock.sendCustomMessage(
        deepEqual(error)
      )
    ).once();
  });

  it('should display a warning in console when init property has been set', () => {
    const consoleSpy = spy(console);
    when(configValidatorMock.validate(anything())).thenReturn({
      value: 'Deprecation message',
      warning: { details: [{ message: 'deprecation message' }], ...anything() },
      error: undefined,
    });
    when(consoleSpy.error(anything())).thenReturn(undefined);
    when(consoleSpy.warn(anything())).thenReturn(undefined);
    sut.resolve(anything());
    verify(consoleSpy.warn('deprecation message')).once();
  });
});
