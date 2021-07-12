import { IVisaCheckoutConfig } from '../../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { ConfigResolver } from '../config-resolver/ConfigResolver';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { ConfigService } from './ConfigService';
import { IConfig } from '../../model/config/IConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { take, toArray } from 'rxjs/operators';
import { JwtDecoder } from '../jwt-decoder/JwtDecoder';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { ValidationError } from 'joi';

describe('ConfigService', () => {
  let resolverMock: ConfigResolver;
  let configService: ConfigService;
  let messageBus: IMessageBus;
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
    jwtDecoderMock = mock(JwtDecoder);
    messageBus = new SimpleMessageBus();

    when(resolverMock.resolve(config)).thenReturn(fullConfig);
    when(jwtDecoderMock.decode<Record<string, unknown>>(JWT)).thenReturn({ payload: {} });
    when(jwtDecoderMock.decode<{ config: IConfig }>(JWT_WITH_CONFIG)).thenReturn({
      payload: {
        config: configFromJwt,
      },
    });

    configService = new ConfigService(
      instance(resolverMock),
      messageBus,
      instance(jwtDecoderMock),
    );
  });

  describe('setup', () => {
    it('resolves the config passed as config object', () => {
      const result = configService.setup(config);

      expect(result).toBe(fullConfig);
      expect(configService.getConfig()).toBe(fullConfig);

      verify(resolverMock.resolve(config)).once();
    });

    it('keeps the jwt and callbacks from config object when using jwt config', () => {
      const submitCallback = () => {
      };
      const errorCallback = () => {
      };

      configService.setup({ jwt: JWT_WITH_CONFIG, submitCallback, errorCallback });

      verify(
        resolverMock.resolve(
          deepEqual({
            ...configFromJwt,
            submitCallback,
            errorCallback,
            successCallback: undefined,
            cancelCallback: undefined,
          }),
        ),
      ).once();
    });

    it('throws an error when config is defined in jwt, but config object has other properties', () => {
      expect(() =>
        configService.setup({
          jwt: JWT_WITH_CONFIG,
          buttonId: 'foobar',
        }),
      ).toThrowError(CANNOT_OVERRIDE);

      expect(() =>
        configService.setup({
          jwt: JWT_WITH_CONFIG,
          successCallback: (): unknown => null,
          submitCallback: (): unknown => null,
          errorCallback: (): unknown => null,
          cancelCallback: (): unknown => null,
        }),
      ).not.toThrowError();
    });
  });

  describe('update', () => {
    it('resolves the full config-provider and publishes it to message bus', () => {
      jest.spyOn(messageBus, 'publish');

      const result = configService.update(config);

      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.CONFIG_CHANGED, data: fullConfig });
      expect(result).toBe(fullConfig);
      expect(configService.getConfig()).toBe(fullConfig);
    });

    it('throws an error if config-provider validation fails', () => {
      const validationError: ValidationError = { message: 'error' } as ValidationError;

      when(resolverMock.resolve(config)).thenThrow(validationError);

      expect(() => configService.update(config)).toThrow(validationError);
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
      const visaConfig: IVisaCheckoutConfig = {
        merchantId: 'foobar',
        livestatus: 1,
        placement: 'st-visa',
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
