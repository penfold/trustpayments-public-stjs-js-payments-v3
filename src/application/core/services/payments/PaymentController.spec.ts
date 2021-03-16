import { ContainerInstance } from 'typedi';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { PaymentController } from './PaymentController';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { IPaymentMethod } from './IPaymentMethod';
import { PaymentMethodToken } from '../../../dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { PaymentResultHandler } from './PaymentResultHandler';
import { IInitPaymentMethod } from './events/IInitPaymentMethod';
import { of, zip } from 'rxjs';
import { Debug } from '../../../../shared/Debug';
import { IPaymentResult } from './IPaymentResult';
import { PaymentStatus } from './PaymentStatus';
import { IStartPaymentMethod } from './events/IStartPaymentMethod';
import { delay } from 'rxjs/operators';
import spyOn = jest.spyOn;

describe('PaymentController', () => {
  let containerMock: ContainerInstance;
  let messageBus: IMessageBus;
  let paymentController: PaymentController;
  let paymentResultHandlerMock: PaymentResultHandler;
  let fooPaymentMethodMock: IPaymentMethod;
  let fooPaymentMethod: IPaymentMethod;
  let barPaymentMethodMock: IPaymentMethod;
  let barPaymentMethod: IPaymentMethod;

  beforeEach(() => {
    containerMock = mock(ContainerInstance);
    paymentResultHandlerMock = mock(PaymentResultHandler);
    fooPaymentMethodMock = mock<IPaymentMethod>();
    fooPaymentMethod = instance(fooPaymentMethodMock);
    barPaymentMethodMock = mock<IPaymentMethod>();
    barPaymentMethod = instance(barPaymentMethodMock);

    messageBus = new SimpleMessageBus();
    paymentController = new PaymentController(instance(containerMock), messageBus, instance(paymentResultHandlerMock));

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
          config
        }
      });

      verify(fooPaymentMethodMock.init(config)).once();
      expect(Debug.log).toHaveBeenCalledWith('Payment method initialized: foo');
    });

    it('logs error message when trying to initialize not existing payment method', () => {
      const config = { aaa: 'bbb' };

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'nonexisting',
          config
        }
      });

      expect(Debug.error).toHaveBeenCalledWith(
        'Payment method initialization failed: nonexisting',
        new Error('Payment method with name nonexisting not found.')
      );
    });

    it('logs error message when payment method initialization fails', () => {
      const config = { aaa: 'bbb' };
      const initializationError = new Error('foo init failed');

      when(fooPaymentMethodMock.init(config)).thenThrow(initializationError);

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          config
        }
      });

      expect(Debug.error).toHaveBeenCalledWith('Payment method initialization failed: foo', initializationError);
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
          config
        }
      });

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'bar',
          config
        }
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
          config
        }
      });

      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'bar',
          config
        }
      });

      verify(fooPaymentMethodMock.init(config)).once();
      verify(barPaymentMethodMock.init(config)).once();
      expect(Debug.error).toHaveBeenCalledWith('Payment method initialization failed: foo', fooError);
      expect(Debug.log).toHaveBeenCalledWith('Payment method initialized: bar');
    });

    it('starts given payment method with data and returns the result to result handler', () => {
      const data = { bbb: 'ccc' };
      const result: IPaymentResult<any> = { status: PaymentStatus.SUCCESS };

      when(fooPaymentMethodMock.start(data)).thenReturn(of(result));

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'foo',
          data
        }
      });

      verify(fooPaymentMethodMock.start(data)).once();
      verify(paymentResultHandlerMock.handle(result)).once();
    });

    it('logs error message when trying to start not existing payment method', () => {
      const data = { bbb: 'ccc' };

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'nonexisting',
          data
        }
      });

      verify(paymentResultHandlerMock.handle(anything())).never();
      expect(Debug.error).toHaveBeenCalledWith(
        'Running payment method failed: nonexisting',
        new Error('Payment method with name nonexisting not found.')
      );
    });

    it('logs error message when payment method processing fails', () => {
      const data = { bbb: 'ccc' };
      const paymentError = new Error('payment failed');

      when(fooPaymentMethodMock.start(data)).thenThrow(paymentError);

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'foo',
          data
        }
      });

      verify(paymentResultHandlerMock.handle(anything())).never();
      expect(Debug.error).toHaveBeenCalledWith('Running payment method failed: foo', paymentError);
    });

    it('doesnt init any payment methods after DESTROY event', () => {
      const config = { foo: 'bar' };

      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      messageBus.publish<IInitPaymentMethod<typeof config>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: 'foo',
          config
        }
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
          data
        }
      });

      verify(fooPaymentMethodMock.start(anything())).never();
    });

    it('starts the second payment method even if the first one failed', () => {
      const data = { aaa: 'bbb' };
      const fooError: Error = new Error('foo failed');
      const result: IPaymentResult<any> = { status: PaymentStatus.SUCCESS };

      when(fooPaymentMethodMock.start(data)).thenThrow(fooError);
      when(barPaymentMethodMock.start(data)).thenReturn(of(result));

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'foo',
          data
        }
      });

      messageBus.publish<IStartPaymentMethod<typeof data>>({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: 'bar',
          data
        }
      });

      verify(fooPaymentMethodMock.start(data)).once();
      verify(barPaymentMethodMock.start(data)).once();
      verify(paymentResultHandlerMock.handle(result)).once();
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
