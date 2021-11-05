import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { take, toArray } from 'rxjs/operators';
import { ValidationError } from 'joi';
import { IVisaCheckoutConfig } from '../../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { ConfigResolver } from '../config-resolver/ConfigResolver';
import { IConfig } from '../../model/config/IConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { ConfigService } from './ConfigService';

describe('ConfigService', () => {
  let sut: ConfigService;
  let resolverMock: ConfigResolver;
  let messageBus: IMessageBus;

  const JWT = 'jwt';

  const config: IConfig = ({ buttonId: 'bar', jwt: JWT } as unknown) as IConfig;
  const fakeConfig: IConfig = ({ foo: 'bar', jwt: JWT } as unknown) as IConfig;

  describe('ConfigService', () => {

    beforeEach(() => {
      resolverMock = mock(ConfigResolver);
      messageBus = new SimpleMessageBus();

      when(resolverMock.resolve(config)).thenReturn(config);

      sut = new ConfigService(
        instance(resolverMock),
        messageBus
      );
    });

    describe('setup()', () => {

      it('should resolve the correct config passed as a config object', () => {
        jest.spyOn(messageBus, 'publish');
        expect(sut.setup(config)).toEqual(config);
        expect(sut.getConfig()).toEqual(config);
        expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.CONFIG_CHANGED, data: config });

        verify(resolverMock.resolve(config)).once();
      });

      it('should return null if config is not valid', () => {
        const validationError: ValidationError = { message: 'error' } as ValidationError;
        when(resolverMock.resolve(config)).thenThrow(validationError);
        expect(sut.setup(fakeConfig)).toEqual(null);
        expect(sut.getConfig()).toEqual(null);
        expect(() => sut.setup(config)).toThrow(validationError);
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
        sut
          .getConfig$(false)
          .pipe(take(3), toArray())
          .subscribe(result => {
            expect(result).toEqual([config1]);
            done();
          });

        sut.setup(config1);
        sut.setup(config2);
        sut.setup(config3);
      });

      it('returns config changes as observable', done => {
        sut
          .getConfig$(true)
          .pipe(take(3), toArray())
          .subscribe(result => {
            expect(result).toEqual([config1, config2, config3]);
            done();
          });

        sut.setup(config1);
        sut.setup(config2);
        sut.setup(config3);
      });
    });

    describe('updateFragment', () => {

      it('updates a given key in configuration', () => {
        const visaConfig: IVisaCheckoutConfig = {
          merchantId: 'foobar',
          livestatus: 1,
          placement: 'st-visa',
        };

        sut.setup(config);
        sut.updateFragment('visaCheckout', visaConfig);

        verify(resolverMock.resolve(deepEqual({ ...config, visaCheckout: visaConfig }))).once();
      });
    });
  });
});
