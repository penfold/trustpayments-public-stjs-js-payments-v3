import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import Container from 'typedi';
import { NotificationType } from '../../models/constants/NotificationType';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { Frame } from '../frame/Frame';
import { SimpleMessageBus } from '../message-bus/SimpleMessageBus';
import { IMessageBus } from '../message-bus/IMessageBus';
import { ITranslator } from '../translator/ITranslator';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { MessageBus } from '../message-bus/MessageBus';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../translator/Translator';
import { ITranslationProvider } from '../translator/ITranslationProvider';
import { TranslationProvider } from '../translator/TranslationProvider';
import { EventScope } from '../../models/constants/EventScope';
import { Notification } from './Notification';

Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('Notification', () => {
  let messageBus: IMessageBus;
  let browserLocalStorage: BrowserLocalStorage;
  let configProvider: ConfigProvider;
  let framesHub: FramesHub;
  let notification: Notification;
  let frame: Frame;
  let translator: ITranslator;

  beforeEach(() => {
    messageBus = new SimpleMessageBus();
    browserLocalStorage = mock(BrowserLocalStorage);
    configProvider = mock<ConfigProvider>();
    framesHub = mock(FramesHub);
    frame = mock(Frame);
    translator = mock(Translator);
    when(translator.translate('Test')).thenReturn('Test');

    document.body.innerHTML = '<div id="st-notification-frame"></div>';

    const config = {
      jwt: '',
      disableNotification: false,
      componentIds: {
        cardNumber: '',
        expirationDate: '',
        securityCode: '',
        notificationFrame: 'st-notification-frame',
      },
      styles: {
        notificationFrame: {
          'color-error': '#FFF333',
        },
      },
    };

    when(configProvider.getConfig()).thenReturn(config);
    when(configProvider.getConfig$()).thenReturn(of(config));
    when(browserLocalStorage.getItem('locale')).thenReturn('en');
    when(framesHub.waitForFrame(CONTROL_FRAME_IFRAME)).thenReturn(of(CONTROL_FRAME_IFRAME));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    notification = new Notification(
      messageBus,
      instance(browserLocalStorage),
      instance(configProvider),
      instance(framesHub),
      instance(frame),
      instance(translator)
    );
  });

  it(`should display notification if ${MessageBus.EVENTS_PUBLIC.NOTIFICATION} has been called`, () => {
    // @ts-ignore
    messageBus.publish(
      {
        data: { content: 'Test', type: NotificationType.Error },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION,
      },
      EventScope.ALL_FRAMES
    );

    expect(document.getElementById('st-notification-frame').textContent).toEqual('Test');
  });
});
