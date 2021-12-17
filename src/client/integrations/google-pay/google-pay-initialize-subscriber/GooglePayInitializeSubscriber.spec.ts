import { anyFunction, anything, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../../application/core/shared/message-bus/SimpleMessageBus';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { GooglePay } from '../GooglePay';
import { IFrameQueryingService } from '../../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { GooglePayInitializeSubscriber } from './GooglePayInitializeSubscriber';

describe('GooglePayInitializeSubscriber', () => {
  let sut: GooglePayInitializeSubscriber;
  let googlePayMock: GooglePay;
  let simpleMessageBus: IMessageBus;
  let frameQueryingServiceMock: IFrameQueryingService;

  const configMock: IConfig = {
    analytics: true,
  };

  beforeEach(() => {
    simpleMessageBus = new SimpleMessageBus();
    googlePayMock = mock(GooglePay);
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.GOOGLE_PAY_CLIENT_INIT, anyFunction())).thenCall((eventType, callback) => {
      callback({ type: eventType, data: configMock });
    });

    sut = new GooglePayInitializeSubscriber(instance(googlePayMock), instance(frameQueryingServiceMock));
  });

  describe('register', () => {
    it('should invoke GooglePay to initialize the library', () => {
      sut.register(simpleMessageBus);
      verify(googlePayMock.init(anything())).once();
    });
  });
});
