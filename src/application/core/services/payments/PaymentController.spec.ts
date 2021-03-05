import { ContainerInstance } from 'typedi';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { PaymentController } from './PaymentController';
import { instance, mock, when } from 'ts-mockito';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { IPaymentMethod } from './IPaymentMethod';
import { PaymentMethodToken } from '../../../dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';

describe('PaymentController', () => {
  let containerMock: ContainerInstance;
  let messageBus: IMessageBus;
  let paymentController: PaymentController;
  let fooPaymentMethodMock: IPaymentMethod;
  let fooPaymentMethod: IPaymentMethod;
  let barPaymentMethodMock: IPaymentMethod;
  let barPaymentMethod: IPaymentMethod;

  beforeEach(() => {
    containerMock = mock(ContainerInstance);
    fooPaymentMethodMock = mock<IPaymentMethod>();
    fooPaymentMethod = instance(fooPaymentMethodMock);
    barPaymentMethodMock = mock<IPaymentMethod>();
    barPaymentMethod = instance(barPaymentMethodMock);

    messageBus = new SimpleMessageBus();
    paymentController = new PaymentController(instance(containerMock), messageBus);

    when(containerMock.getMany(PaymentMethodToken)).thenReturn([fooPaymentMethod, barPaymentMethod]);
    when(fooPaymentMethodMock.getName()).thenReturn('foo');
    when(barPaymentMethodMock.getName()).thenReturn('bar');
  });

  describe('init', () => {
    it('collects all available payment methods', () => {
      paymentController.init();
      expect(paymentController.hasPaymentMethod('foo')).toBe(true);
      expect(paymentController.getPaymentMethod('foo')).toBe(fooPaymentMethod);
      expect(paymentController.hasPaymentMethod('bar')).toBe(true);
      expect(paymentController.getPaymentMethod('bar')).toBe(barPaymentMethod);
    });

    it('removes all payment methods on DESTROY event', () => {
      paymentController.init();
      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      expect(paymentController.hasPaymentMethod('foo')).toBe(false);
      expect(paymentController.hasPaymentMethod('bar')).toBe(false);
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
