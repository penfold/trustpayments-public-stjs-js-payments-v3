import { FrameIdentifier } from '../../shared/services/message-bus/FrameIdentifier';
import { ContainerInstance } from 'typedi';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { SentryService } from '../../shared/services/sentry/SentryService';
import { MessageSubscriberRegistry } from '../../shared/services/message-bus/MessageSubscriberRegistry';
import { instance, mock, verify, when } from 'ts-mockito';
import { environment } from '../../environments/environment';
import { IMessageSubscriber } from '../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { ClientBootstrap } from './ClientBootstrap';
import { IConfig } from '../../shared/model/config/IConfig';
import { ST } from '../st/ST';
import { MERCHANT_PARENT_FRAME } from '../../application/core/models/constants/Selectors';
import { MessageBusToken, MessageSubscriberToken, StoreToken } from '../../shared/dependency-injection/InjectionTokens';
import { FramesHub } from '../../shared/services/message-bus/FramesHub';
import { InterFrameCommunicator } from '../../shared/services/message-bus/InterFrameCommunicator';

describe('ClientBootstrap', () => {
  let frameIdentifierMock: FrameIdentifier;
  let framesHubMock: FramesHub;
  let containerMock: ContainerInstance;
  let browserLocalStorageMock: BrowserLocalStorage;
  let sentryServiceMock: SentryService;
  let messageSubscriberRegistryMock: MessageSubscriberRegistry;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let stMock: ST;
  let st: ST;
  let clientBootstrap: ClientBootstrap;
  const config: IConfig = {} as IConfig;

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    framesHubMock = mock(FramesHub);
    containerMock = mock(ContainerInstance);
    browserLocalStorageMock = mock(BrowserLocalStorage);
    sentryServiceMock = mock(SentryService);
    messageSubscriberRegistryMock = mock(MessageSubscriberRegistry);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    stMock = mock(ST);
    st = instance(stMock);
    clientBootstrap = new ClientBootstrap(instance(frameIdentifierMock), instance(containerMock));

    when(containerMock.get(FramesHub)).thenReturn(instance(framesHubMock));
    when(containerMock.get(BrowserLocalStorage)).thenReturn(instance(browserLocalStorageMock));
    when(containerMock.get(SentryService)).thenReturn(instance(sentryServiceMock));
    when(containerMock.get(MessageSubscriberRegistry)).thenReturn(instance(messageSubscriberRegistryMock));
    when(containerMock.get(InterFrameCommunicator)).thenReturn(instance(interFrameCommunicatorMock));
    when(containerMock.get(ST)).thenReturn(st);
  });

  describe('run', () => {
    it('sets frame name on frame identifier', () => {
      clientBootstrap.run(config);

      verify(frameIdentifierMock.setFrameName(MERCHANT_PARENT_FRAME)).once();
    });

    it('initializes core services', () => {
      clientBootstrap.run(config);

      verify(containerMock.get(MessageBusToken)).once();
      verify(containerMock.get(StoreToken)).once();
      verify(containerMock.get(BrowserLocalStorage)).once();
      verify(containerMock.get(FramesHub)).once();
      verify(containerMock.get(InterFrameCommunicator)).once();

      verify(browserLocalStorageMock.init()).once();
      verify(framesHubMock.init()).once();
      verify(interFrameCommunicatorMock.init()).once();
    });

    it('creates and returns the ST instance', () => {
      const result = clientBootstrap.run(config);

      verify(containerMock.get(ST)).once();
      verify(stMock.init(config)).once();

      expect(result).toBe(st);
    });

    it('initializes the sentry service', () => {
      clientBootstrap.run(config);

      verify(containerMock.get(SentryService)).once();
      verify(sentryServiceMock.init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS)).once();
    });

    it('registers all message subscribers if running the ControlFrame component', () => {
      const messageSubscriberOne = instance(mock<IMessageSubscriber>());
      const messageSubscriberTwo = instance(mock<IMessageSubscriber>());

      when(containerMock.getMany(MessageSubscriberToken)).thenReturn([messageSubscriberOne, messageSubscriberTwo]);

      clientBootstrap.run(config);

      verify(messageSubscriberRegistryMock.register(messageSubscriberOne, messageSubscriberTwo)).once();
    });
  });
});
