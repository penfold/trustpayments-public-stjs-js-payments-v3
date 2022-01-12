import { instance, mock, verify } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { GAEventType } from './events';
import { GoogleAnalytics } from './GoogleAnalytics';
import { PaymentEventsSubscriber } from './PaymentEventsSubscriber';

describe('register()', () => {
  let paymentEventsSubscriber: PaymentEventsSubscriber;
  let googleAnalyticsMock: GoogleAnalytics;
  let messageBus: IMessageBus;

  beforeEach(() => {
    googleAnalyticsMock = mock(GoogleAnalytics);
    messageBus = new SimpleMessageBus();
    paymentEventsSubscriber = new PaymentEventsSubscriber(instance(googleAnalyticsMock));
    paymentEventsSubscriber.register(messageBus);
  });

  it('should send init started event to Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.INIT, 'Payment method GooglePay init started')).once();
  });

  it('should send init completed event to Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.INIT, 'Payment method GooglePay init completed')).once();
  });

  it('should send init failed event to Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.INIT, 'Payment method GooglePay init failed')).once();
  });

  it('should send payment started event to Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_STARTED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.PAYMENT, 'Payment by GooglePay started')).once();
  });

  it('should send payment completed event to Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.PAYMENT, 'Payment by GooglePay completed')).once();
  });

  it('should send payment failed event to Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.PAYMENT, 'Payment by GooglePay failed')).once();
  });

  it('should send payment canceled event to Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.PAYMENT, 'Payment by GooglePay canceled')).once();
  });
});