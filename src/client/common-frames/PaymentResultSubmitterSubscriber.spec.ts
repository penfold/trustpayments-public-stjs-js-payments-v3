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
    it('should call PaymentResultSubmitter.submitForm() on SUBMIT_PAYMENT_RESULT event', () => {
      const submitData = { foo: 'bar', bar: 'baz' };

      messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: submitData });

      verify(paymentResultSubmitterMock.submitForm(submitData)).once();
    });

    it('should call PaymentResultSubmitter.prepareForm() on APPEND_FORM_DATA event', () => {
      const submitData = { foo: 'bar', bar: 'baz' };

      messageBus.publish({ type: PUBLIC_EVENTS.APPEND_FORM_DATA, data: submitData });

      verify(paymentResultSubmitterMock.prepareForm(submitData)).once();
    });

    it('shouldnt call submitForm() or prepareForm() after DESTROY event', () => {
      const submitData = { foo: 'bar', bar: 'baz' };

      messageBus.publish({ type: PUBLIC_EVENTS.DESTROY });
      messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT, data: submitData });
      messageBus.publish({ type: PUBLIC_EVENTS.APPEND_FORM_DATA, data: submitData });

      verify(paymentResultSubmitterMock.submitForm(anything())).never();
      verify(paymentResultSubmitterMock.prepareForm(anything())).never();
    });
  });
});
