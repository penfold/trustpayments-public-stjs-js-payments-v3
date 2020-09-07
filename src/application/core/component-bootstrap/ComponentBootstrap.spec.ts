import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { ContainerInstance } from 'typedi';
import { ComponentBootstrap } from './ComponentBootstrap';
import { instance, mock, verify, when } from 'ts-mockito';
import { CardNumber } from '../../components/card-number/CardNumber';
import { Store } from '../store/Store';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';
import { IMessageSubscriber } from '../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { MessageSubscriberRegistry } from '../../../shared/services/message-bus/MessageSubscriberRegistry';
import { ControlFrame } from '../../components/control-frame/ControlFrame';
import { CARD_NUMBER_IFRAME, CONTROL_FRAME_IFRAME } from '../models/constants/Selectors';
import { MessageBus } from '../shared/message-bus/MessageBus';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';

describe('ComponentBootstrap', () => {
  let frameIdentifierMock: FrameIdentifier;
  let containerMock: ContainerInstance;
  let browserLocalStorageMock: BrowserLocalStorage;
  let framesHubMock: FramesHub;
  let sentryServiceMock: SentryService;
  let messageSubscriberRegistryMock: MessageSubscriberRegistry;
  let componentBootstrap: ComponentBootstrap;

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    containerMock = mock(ContainerInstance);
    browserLocalStorageMock = mock(BrowserLocalStorage);
    framesHubMock = mock(FramesHub);
    sentryServiceMock = mock(SentryService);
    messageSubscriberRegistryMock = mock(MessageSubscriberRegistry);
    componentBootstrap = new ComponentBootstrap(instance(frameIdentifierMock), instance(containerMock));

    when(frameIdentifierMock.isControlFrame()).thenReturn(false);
    when(containerMock.get(BrowserLocalStorage)).thenReturn(instance(browserLocalStorageMock));
    when(containerMock.get(FramesHub)).thenReturn(instance(framesHubMock));
    when(containerMock.get(SentryService)).thenReturn(instance(sentryServiceMock));
    when(containerMock.get(MessageSubscriberRegistry)).thenReturn(instance(messageSubscriberRegistryMock));
  });

  describe('run', () => {
    it('sets frame name on frame identifier', () => {
      componentBootstrap.run(CARD_NUMBER_IFRAME, CardNumber);

      verify(frameIdentifierMock.setFrameName(CARD_NUMBER_IFRAME)).once();
    });

    it('initializes core services', () => {
      componentBootstrap.run(CARD_NUMBER_IFRAME, CardNumber);

      verify(containerMock.get(MessageBus)).once();
      verify(containerMock.get(Store)).once();
      verify(containerMock.get(BrowserLocalStorage)).once();
      verify(containerMock.get(FramesHub)).once();

      verify(browserLocalStorageMock.init()).once();
      verify(framesHubMock.notifyReadyState()).once();
    });

    it('creates and returns the component instance', () => {
      const cardNumber: CardNumber = instance(mock(CardNumber));

      when(containerMock.get(CardNumber)).thenReturn(cardNumber);

      const result = componentBootstrap.run(CARD_NUMBER_IFRAME, CardNumber);

      verify(containerMock.get(CardNumber)).once();

      expect(result).toBe(cardNumber);
    });

    it('initializes the sentry service', () => {
      componentBootstrap.run(CARD_NUMBER_IFRAME, CardNumber);

      verify(containerMock.get(SentryService)).once();
      verify(sentryServiceMock.init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS)).once();
    });

    it('registers all message subscribers if running the ControlFrame component', () => {
      const messageSubscriberOne = instance(mock<IMessageSubscriber>());
      const messageSubscriberTwo = instance(mock<IMessageSubscriber>());

      when(frameIdentifierMock.isControlFrame()).thenReturn(true);
      when(containerMock.getMany(MessageSubscriberToken)).thenReturn([messageSubscriberOne, messageSubscriberTwo]);

      componentBootstrap.run(CONTROL_FRAME_IFRAME, ControlFrame);

      verify(messageSubscriberRegistryMock.register(messageSubscriberOne, messageSubscriberTwo)).once();
    });
  });
});
