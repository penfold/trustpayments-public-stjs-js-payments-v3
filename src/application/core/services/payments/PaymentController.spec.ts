import { ContainerInstance } from 'typedi';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { of, zip } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { PaymentMethodToken } from '../../../dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { Debug } from '../../../../shared/Debug';
import { GooglePaymentMethodName } from '../../../../integrations/google-pay/models/IGooglePaymentMethod';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { PaymentController } from './PaymentController';
import { IPaymentMethod } from './IPaymentMethod';
import { PaymentResultHandler } from './PaymentResultHandler';
import { IInitPaymentMethod } from './events/IInitPaymentMethod';
import { IPaymentResult } from './IPaymentResult';
import { PaymentStatus } from './PaymentStatus';
import { IStartPaymentMethod } from './events/IStartPaymentMethod';
import { PaymentError } from './error/PaymentError';
import { ErrorResultFactory } from './ErrorResultFactory';
import spyOn = jest.spyOn;

describe('PaymentController', () => {
  let containerMock: ContainerInstance;
  let messageBus: IMessageBus;
  let paymentController: PaymentController;
  let paymentResultHandlerMock: PaymentResultHandler;
  let errorResultFactoryMock: ErrorResultFactory;
  let sentryServiceMock: SentryService;
  let fooPaymentMethodMock: IPaymentMethod;
  let fooPaymentMethod: IPaymentMethod;
  let barPaymentMethodMock: IPaymentMethod;
  let barPaymentMethod: IPaymentMethod;

  beforeEach(() => {
    containerMock = mock(ContainerInstance);
    paymentResultHandlerMock = mock(PaymentResultHandler);
    errorResultFactoryMock = mock(ErrorResultFactory);
    sentryServiceMock = mock(SentryService);
    fooPaymentMethodMock = mock<IPaymentMethod>();
    fooPaymentMethod = instance(fooPaymentMethodMock);
    barPaymentMethodMock = mock<IPaymentMethod>();
    barPaymentMethod = instance(barPaymentMethodMock);

    messageBus = new SimpleMessageBus();
    paymentController = new PaymentController(
      instance(containerMock),
      messageBus,
      instance(paymentResultHandlerMock),
      instance(errorResultFactoryMock),
      instance(sentryServiceMock),
    );

    when(containerMock.getMany(PaymentMethodToken)).thenReturn([fooPaymentMethod, barPaymentMethod]);
    when(fooPaymentMethodMock.getName()).thenReturn('foo');
    when(barPaymentMethodMock.getName()).thenReturn('bar');
  });

  describe('init', () => {
    beforeEach(() => {
      paymentController.init();

      spyOn(Debug, 'log').mockReturnValue(undefined);
      spyOn(Debug, 'error').mockReturnValue(undefined);
    });

    it('collects all available payment methods', () => {
      expect(paymentController.hasPaymentMethod('foo')).toBe(true);
      expect(paymentController.getPaymentMethod('foo')).toBe(fooPaymentMethod);
      expect(paymentController.hasPaymentMethod('bar')).toBe(true);
      expect(paymentController.getPaymentMethod('bar')).toBe(barPaymentMethod);
    });

    it('removes all payment methods on DESTROY event', () => {
      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      expect(paymentController.hasPaymentMethod('foo')).toBe(false);
      expect(paymentController.hasPaymentMethod('bar')).toBe(false);
    });

    it('initializes given payment method with config', () => {
      const config = { aaa: 'bbb' };

      when(fooPaymentMethodMock.init(config)).thenReturn(of(undefined));

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          config,
        },
      });

      verify(fooPaymentMethodMock.init(config)).once();
      expect(Debug.log).toHaveBeenCalledWith('Payment method initialized: foo');
    });

    it('logs error message when trying to initialize not existing payment method', () => {
      const config = { aaa: 'bbb' };
      const error = new Error('Payment method with name nonexisting not found.');

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'nonexisting',
          config,
        },
      });

      expect(Debug.error).toHaveBeenCalledWith(
        'Payment method initialization failed: nonexisting',
        error,
      );

      verify(sentryServiceMock.sendCustomMessage(deepEqual(
        PaymentError.duringInit('Payment method initialization failed', 'nonexisting', error)
      ))).once();
    });

    it('logs error message when payment method initialization fails', () => {
      const config = { aaa: 'bbb' };
      const initializationError = new Error('foo init failed');

      when(fooPaymentMethodMock.init(config)).thenThrow(initializationError);

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          config,
        },
      });

      expect(Debug.error).toHaveBeenCalledWith('Payment method initialization failed: foo', initializationError);

      verify(sentryServiceMock.sendCustomMessage(deepEqual(
        PaymentError.duringInit('Payment method initialization failed', 'foo', initializationError)
      ))).once();
    });

    it('initializes all payment methods', done => {
      const config = { aaa: 'bbb' };
      const result1 = of(undefined).pipe(delay(100));
      const result2 = of(undefined);
      when(fooPaymentMethodMock.init(config)).thenReturn(result1);
      when(barPaymentMethodMock.init(config)).thenReturn(result2);

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          config,
        },
      });

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'bar',
          config,
        },
      });

      zip(result1, result2).subscribe(() => {
        verify(fooPaymentMethodMock.init(config)).once();
        verify(barPaymentMethodMock.init(config)).once();
        expect(Debug.log).toHaveBeenCalledWith('Payment method initialized: foo');
        expect(Debug.log).toHaveBeenCalledWith('Payment method initialized: bar');
        done();
      });
    });

    it('initializes second payment method even if the first one failed', () => {
      const config = { aaa: 'bbb' };
      const fooError: Error = new Error('foo failed');
      when(fooPaymentMethodMock.init(config)).thenThrow(fooError);
      when(barPaymentMethodMock.init(config)).thenReturn(of(undefined));

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          config,
        },
      });

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'bar',
          config,
        },
      });

      verify(fooPaymentMethodMock.init(config)).once();
      verify(barPaymentMethodMock.init(config)).once();
      expect(Debug.error).toHaveBeenCalledWith('Payment method initialization failed: foo', fooError);
      expect(Debug.log).toHaveBeenCalledWith('Payment method initialized: bar');
    });
  });

  describe('start()', () => {
    beforeEach(() => {
      paymentController.init();

      spyOn(Debug, 'log').mockReturnValue(undefined);
      spyOn(Debug, 'error').mockReturnValue(undefined);
    });

    it('starts given payment method with data and returns the result to result handler', async () => {
      const data = { bbb: 'ccc' };
      const result: IPaymentResult<unknown> = { status: PaymentStatus.SUCCESS, paymentMethodName: 'Card' };
      spyOn(messageBus, 'publish');

      when(fooPaymentMethodMock.start(data)).thenReturn(of(result));

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'foo',
          data,
        },
      });

      verify(fooPaymentMethodMock.start(data)).once();
      verify(paymentResultHandlerMock.handle(result)).once();
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.JWT_RESET });
    });

    it('logs error message when trying to start not existing payment method', () => {
      const data = { bbb: 'ccc' };
      const error = new Error('Payment method with name nonexisting not found.');
      const errorResult: IPaymentResult<Error> = {
        status: PaymentStatus.ERROR,
        data: error,
        error: {
          code: 123,
          message: 'error',
        },
        paymentMethodName: 'nonexisting',
      };

      when(errorResultFactoryMock.createResultFromError(deepEqual(error), 'nonexisting')).thenReturn(errorResult);

      spyOn(messageBus, 'publish');

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'nonexisting',
          data,
        },
      });

      verify(paymentResultHandlerMock.handle(errorResult)).once();
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.JWT_RESET });
      expect(Debug.error).toHaveBeenCalledWith(
        'Running payment method failed: nonexisting',
        error,
      );

      verify(sentryServiceMock.sendCustomMessage(deepEqual(
        PaymentError.duringProcess('Running payment method failed', 'nonexisting', error)
      ))).once();
    });

    it('logs error message and returns error result when payment method processing fails', () => {
      const data = { bbb: 'ccc' };
      const paymentError = new Error('payment failed');
      const errorResult: IPaymentResult<Error> = {
        status: PaymentStatus.ERROR,
        data: paymentError,
        error: {
          code: 123,
          message: 'error',
        },
        paymentMethodName: 'foo',
      };

      spyOn(messageBus, 'publish');

      when(errorResultFactoryMock.createResultFromError(paymentError, 'foo')).thenReturn(errorResult);
      when(fooPaymentMethodMock.start(data)).thenThrow(paymentError);

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'foo',
          data,
        },
      });

      verify(paymentResultHandlerMock.handle(errorResult)).once();
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.JWT_RESET });
      expect(Debug.error).toHaveBeenCalledWith('Running payment method failed: foo', paymentError);

      verify(sentryServiceMock.sendCustomMessage(deepEqual(
        PaymentError.duringProcess('Running payment method failed', 'foo', paymentError)
      ))).once();
    });

    it('doesnt init any payment methods after DESTROY event', () => {
      const config = { foo: 'bar' };

      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          config,
        },
      });

      verify(fooPaymentMethodMock.init(anything())).never();
    });

    it('doesnt start any payment methods after DESTROY event', () => {
      const data = { foo: 'bar' };

      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          data,
        },
      });

      verify(fooPaymentMethodMock.start(anything())).never();
    });

    it('starts the second payment method even if the first one failed', () => {
      const data = { aaa: 'bbb' };
      const fooError: Error = new Error('foo failed');
      const result: IPaymentResult<unknown> = { status: PaymentStatus.SUCCESS, paymentMethodName: GooglePaymentMethodName };
      spyOn(messageBus, 'publish');

      when(fooPaymentMethodMock.start(data)).thenThrow(fooError);
      when(barPaymentMethodMock.start(data)).thenReturn(of(result));

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'foo',
          data,
        },
      });

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'bar',
          data,
        },
      });

      verify(fooPaymentMethodMock.start(data)).once();
      verify(barPaymentMethodMock.start(data)).once();
      verify(paymentResultHandlerMock.handle(result)).once();
      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.JWT_RESET });
      expect(Debug.error).toHaveBeenCalledWith('Running payment method failed: foo', fooError);
    });
  });

  describe('getPaymentMethod', () => {
    it('throw an error when payment method with given name doesnt exist', () => {
      const name = 'nonexisting';
      expect(() => paymentController.getPaymentMethod(name)).toThrowError(
        `Payment method with name ${name} not found.`
      );
    });
  });
});
