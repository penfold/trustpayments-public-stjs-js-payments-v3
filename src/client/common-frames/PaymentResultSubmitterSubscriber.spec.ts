import { PaymentResultSubmitter } from './PaymentResultSubmitter';
import { PaymentResultSubmitterSubscriber } from './PaymentResultSubmitterSubscriber';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { anything, instance, mock, verify } from 'ts-mockito';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';

describe('PaymentResultSubmitterSubscriber', () => {
  let paymentResultSubmitterMock: PaymentResultSubmitter;
  let messageBus: IMessageBus;
  let paymentResultSubmitterSubscriber: PaymentResultSubmitterSubscriber;

  beforeEach(() => {
    paymentResultSubmitterMock = mock(PaymentResultSubmitter);
    messageBus = new SimpleMessageBus();
    paymentResultSubmitterSubscriber = new PaymentResultSubmitterSubscriber(instance(paymentResultSubmitterMock));
    paymentResultSubmitterSubscriber.register(messageBus);
  });

  describe('register', () => {
    it('should call PaymentResultSubmitter.submit() on SUBMIT_PAYMENT_RESULT event', () => {
      const submitData = { foo: 'bar', bar: 'baz' };

      messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: submitData });

      verify(paymentResultSubmitterMock.submit(submitData)).once();
    });

    it('shouldnt call PaymentResultSubmitter.submit() after DESTROY event', () => {
      const submitData = { foo: 'bar', bar: 'baz' };

      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: submitData });

      verify(paymentResultSubmitterMock.submit(anything())).never();
    });
  });
});
