import { instance, mock, verify } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { GAEventType } from './events';
import { GoogleAnalytics } from './GoogleAnalytics';
import { GoogleAnalyticsInitializer } from './GoogleAnalyticsInitializer';

describe('register()', () => {
  let googleAnalyticsInitializer: GoogleAnalyticsInitializer;
  let googleAnalyticsMock: GoogleAnalytics;
  let messageBus: IMessageBus;

  beforeEach(() => {
    googleAnalyticsMock = mock(GoogleAnalytics);
    // when(jwtDecoderMock.decode(newJwt)).thenReturn({ payload: { locale: 'no_NO' } });
    messageBus = new SimpleMessageBus();
    googleAnalyticsInitializer = new GoogleAnalyticsInitializer(instance(googleAnalyticsMock));
    googleAnalyticsInitializer.register(messageBus);
  });

  it('should send example event do Google Analytics', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(googleAnalyticsMock.sendGaData('event', 'GooglePay', GAEventType.INIT, 'Payment method GooglePay init started')).once();
  });
});