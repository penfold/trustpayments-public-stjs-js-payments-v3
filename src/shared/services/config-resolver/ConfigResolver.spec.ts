import { anything, instance, mock, spy, verify, when } from 'ts-mockito';
import {
  config,
  configResolved,
  minimalConfig,
  minimalDefaultConfigResolve,
} from './ConfigResolverTestData';
import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from '../config-validator/ConfigValidator';

describe('ConfigResolver', () => {
  let sut: ConfigResolver;
  let configValidatorMock: ConfigValidator;

  beforeAll(() => {
    when(spy(console).error(anything())).thenReturn(undefined);
  });

  beforeEach(() => {
    configValidatorMock = mock(ConfigValidator);
    sut = new ConfigResolver(instance(configValidatorMock));

    when(configValidatorMock.validate(anything())).thenReturn({ value: null });
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
