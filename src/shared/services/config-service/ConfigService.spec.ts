import { ConfigResolver } from '../config-resolver/ConfigResolver';
import { ConfigValidator } from '../config-validator/ConfigValidator';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { ConfigService } from './ConfigService';
import { IConfig } from '../../model/config/IConfig';
import { ValidationError } from 'joi';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { MessageBusMock } from '../../../testing/mocks/MessageBusMock';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { take, toArray } from 'rxjs/operators';
import { JwtDecoder } from '../jwt-decoder/JwtDecoder';
import { IStJwtObj } from '../../../application/core/models/IStJwtObj';
import { IVisaConfig } from '../../../application/core/integrations/visa-checkout/IVisaConfig';

describe('ConfigService', () => {
  let resolverMock: ConfigResolver;
  let validatorMock: ConfigValidator;
  let configService: ConfigService;
  let messageBus: MessageBus;
  let jwtDecoderMock: JwtDecoder;

  const JWT = 'jwt';
  const JWT_WITH_CONFIG = 'jwt-with-config';
  const CANNOT_OVERRIDE =
    'Cannot override the configuration specified in the JWT. ' +
    'The config object should contain only the JWT and callbacks (optionally).';

  const config: IConfig = ({ foo: 'bar', jwt: JWT } as unknown) as IConfig;
  const configFromJwt: IConfig = ({ foo: 'bar', jwt: JWT_WITH_CONFIG } as unknown) as IConfig;
  const fullConfig: IConfig = ({ bar: 'baz', jwt: JWT } as unknown) as IConfig;

  beforeEach(() => {
    resolverMock = mock(ConfigResolver);
    validatorMock = mock(ConfigValidator);
    jwtDecoderMock = mock(JwtDecoder);
    messageBus = (new MessageBusMock() as unknown) as MessageBus;
    configService = new ConfigService(
      instance(resolverMock),
      instance(validatorMock),
      messageBus,
      instance(jwtDecoderMock)
    );

    when(resolverMock.resolve(config)).thenReturn(fullConfig);
    when(validatorMock.validate(config)).thenReturn(null);
    when(jwtDecoderMock.decode<IStJwtObj>(JWT)).thenReturn({ payload: {} });
    when(jwtDecoderMock.decode<IStJwtObj>(JWT_WITH_CONFIG)).thenReturn({ payload: { config: configFromJwt } });
  });

  describe('setup', () => {
    it('resolves the config passed as config object', () => {
      const result = configService.setup(config);

      expect(result).toBe(fullConfig);
      expect(configService.getConfig()).toBe(fullConfig);

      verify(resolverMock.resolve(config)).once();
    });

    it('resolves the config passed in the jwt payload', () => {
      configService.setup({ jwt: JWT_WITH_CONFIG });

      verify(resolverMock.resolve(deepEqual(configFromJwt))).once();
    });

    fit('keeps the jwt and callbacks from config object when using jwt config', () => {
      const submitCallback = () => {};
      const errorCallback = () => {};

      configService.setup({ jwt: JWT_WITH_CONFIG, submitCallback, errorCallback });

      verify(
        resolverMock.resolve(
          deepEqual({
            ...configFromJwt,
            submitCallback,
            errorCallback,
            successCallback: undefined,
            cancelCallback: undefined
          })
        )
      ).once();
    });

    it('throws an error when config is defined in jwt, but config object has other properties', () => {
      expect(() =>
        configService.setup({
          jwt: JWT_WITH_CONFIG,
          buttonId: 'foobar'
        })
      ).toThrowError(CANNOT_OVERRIDE);

      expect(() =>
        configService.setup({
          jwt: JWT_WITH_CONFIG,
          successCallback: (): any => null,
          submitCallback: (): any => null,
          errorCallback: (): any => null,
          cancelCallback: (): any => null
        })
      ).not.toThrowError();
    });
  });

  describe('update', () => {
    it('resolves the full config-provider and publishes it to message bus', () => {
      spyOn(messageBus, 'publish');

      const result = configService.update(config);

      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.CONFIG_CHANGED, data: fullConfig });
      expect(result).toBe(fullConfig);
      expect(configService.getConfig()).toBe(fullConfig);
    });

    it('throws an error if config-provider validation fails', () => {
      const validationError = instance(mock<ValidationError>());

      when(validatorMock.validate(fullConfig)).thenReturn(validationError);

      expect(() => configService.update(config)).toThrow();
    });

    it('throws an error if trying to update configuration set in jwt', () => {
      configService.setup({ jwt: JWT_WITH_CONFIG });

      expect(() => configService.update(config)).toThrowError(CANNOT_OVERRIDE);
    });
  });

  describe('getConfig$()', () => {
    const config1: IConfig = ({ foo: 'aaa' } as unknown) as IConfig;
    const config2: IConfig = ({ foo: 'bbb' } as unknown) as IConfig;
    const config3: IConfig = ({ foo: 'ccc' } as unknown) as IConfig;

    beforeEach(() => {
      when(resolverMock.resolve(anything())).thenCall(value => value);
    });

    it('returns config as observable once', done => {
      configService
        .getConfig$(false)
        .pipe(take(3), toArray())
        .subscribe(result => {
          expect(result).toEqual([config1]);
          done();
        });

      configService.update(config1);
      configService.update(config2);
      configService.update(config3);
    });

    it('returns config changes as observable', done => {
      configService
        .getConfig$(true)
        .pipe(take(3), toArray())
        .subscribe(result => {
          expect(result).toEqual([config1, config2, config3]);
          done();
        });

      configService.update(config1);
      configService.update(config2);
      configService.update(config3);
    });
  });

  describe('updateJwt', () => {
    it('updates the jwt in the config', () => {
      configService.setup(config);
      configService.updateJwt('new-jwt');

      verify(resolverMock.resolve(deepEqual({ ...fullConfig, jwt: 'new-jwt' }))).once();
    });
  });

  describe('updateFragment', () => {
    it('updates a given key in configuration', () => {
      const visaConfig: IVisaConfig = {
        merchantId: 'foobar',
        livestatus: 1,
        placement: 'st-visa',
        requestTypes: []
      };

      configService.setup(config);
      configService.updateFragment('visaCheckout', visaConfig);

      verify(resolverMock.resolve(deepEqual({ ...fullConfig, visaCheckout: visaConfig }))).once();
    });
    it('throws an error if trying to update configuration set in jwt', () => {
      configService.setup({ jwt: JWT_WITH_CONFIG });

      expect(() => configService.updateFragment('components', { startOnLoad: true })).toThrowError(CANNOT_OVERRIDE);
    });
  });
});
