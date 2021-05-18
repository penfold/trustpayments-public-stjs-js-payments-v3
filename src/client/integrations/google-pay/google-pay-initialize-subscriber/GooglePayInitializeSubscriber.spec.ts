import { deepEqual, instance, mock, verify } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { IInitPaymentMethod } from '../../../../application/core/services/payments/events/IInitPaymentMethod';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../../application/core/shared/message-bus/SimpleMessageBus';
import { GooglePaymentMethodName } from '../../../../integrations/google-pay/models/IGooglePaymentMethod';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { GooglePay } from '../GooglePay';
import { GooglePayInitializeSubscriber } from './GooglePayInitializeSubscriber';

describe('GooglePayInitializeSubscriber', () => {
  let sut: GooglePayInitializeSubscriber;
  let googlePayMock: GooglePay;
  let simpleMessageBus: IMessageBus;

  const configMock: IConfig = {
    analytics: true,
  };
  const eventMock: IMessageBusEvent<IInitPaymentMethod<IConfig>> = {
    type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
    data: {
      config: configMock,
      name: GooglePaymentMethodName,
    },
  };

  beforeEach(() => {
    simpleMessageBus = new SimpleMessageBus();
    googlePayMock = mock(GooglePay);

    sut = new GooglePayInitializeSubscriber(instance(googlePayMock));
  });

  describe('register', () => {
    it('should invoke GooglePay to initialize the library', () => {
      sut.register(simpleMessageBus);

      simpleMessageBus.publish(eventMock);

      verify(googlePayMock.init(deepEqual(configMock))).once();
    });

    it(`should not invoke GooglePay when name is different than ${GooglePaymentMethodName}`, () => {
      sut.register(simpleMessageBus);

      simpleMessageBus.publish({
        ...eventMock,
        data: {
          ...eventMock.data,
          name: 'name not matched',
        },
      });

      verify(googlePayMock.init(deepEqual(configMock))).never();
    });
  });
});
