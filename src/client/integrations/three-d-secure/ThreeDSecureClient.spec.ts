import {
  CardType, ChallengeDisplayMode, ConfigInterface, LoggingLevel, ResultActionCode,
  ThreeDSecureFactory,
  ThreeDSecureInterface, ThreeDSecureVersion,
} from '@trustpayments/3ds-sdk-js';
import { Observable, of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { TranslationProvider } from '../../../application/core/shared/translator/TranslationProvider';
import { Translator } from '../../../application/core/shared/translator/Translator';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { ThreeDSecureClient } from './ThreeDSecureClient';
import { IMethodUrlData } from './IMethodUrlData';
import { IChallengeData } from './IChallengeData';
import DoneCallback = jest.DoneCallback;

describe('ThreeDSecureClient', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let threeDSecureFactoryMock: ThreeDSecureFactory;
  let threeDSecureMock: ThreeDSecureInterface;
  let sut: ThreeDSecureClient;
  let translator: Translator;
  let translationProvider: TranslationProvider;
  let communicationCallbacks: Map<string, <T>(event: IMessageBusEvent) => Observable<T>>;
  let messageBusMock: IMessageBus;

  const sendMessage = <T>(event: IMessageBusEvent): Observable<T> => {
    return communicationCallbacks.get(event.type)(event);
  };

  const configMock: ConfigInterface = {
    loggingLevel: LoggingLevel.ALL,
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
    translations: {
      cancel: 'Cancel',
    },
  };
  const browserDataMock = {
    browserJavaEnabled: window.navigator.javaEnabled(),
    browserJavascriptEnabled: true,
    browserLanguage: window.navigator.language,
    browserScreenWidth: window.screen.width,
    browserScreenHeight: window.screen.height,
    browserColorDepth: 24,
    browserUserAgent: window.navigator.userAgent,
    browserTZ: new Date().getTimezoneOffset(),
    browserAcceptHeader: 'acceptHeaderMock',
    browserIP: 'ipMock',
  };
  const methodUrlResultMock = {
    status: ResultActionCode.SUCCESS,
    description: 'Success',
    transactionId: 'mockTransId',
  };
  const challengeResultMock = {
    status: ResultActionCode.SUCCESS,
    description: 'Success',
    transactionId: 'mockTransId',
  };

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    threeDSecureFactoryMock = mock(ThreeDSecureFactory);
    threeDSecureMock = mock<ThreeDSecureInterface>();
    communicationCallbacks = new Map();
    translationProvider = new TranslationProvider();
    translator = new Translator(translationProvider);
    messageBusMock = new SimpleMessageBus();

    when(interFrameCommunicatorMock.whenReceive(anything())).thenCall((eventType: string) => {
      return {
        thenRespond: (callback: <T>(event: IMessageBusEvent) => Observable<T>) => {
          communicationCallbacks.set(eventType, callback);
        },
      };
    });

    when(threeDSecureFactoryMock.create()).thenReturn(instance(threeDSecureMock));
    when(threeDSecureMock.init$(anything())).thenReturn(of(configMock));
    when(threeDSecureMock.run3DSMethod$(anything(), anything(), anything())).thenReturn(of(methodUrlResultMock));
    when(threeDSecureMock.doChallenge$(anything(), anything(), anything(), anything(), anything(), anything())).thenReturn(of(challengeResultMock));
    when(threeDSecureMock.getBrowserData$(anything())).thenReturn(of(browserDataMock));

    sut = new ThreeDSecureClient(
      instance(interFrameCommunicatorMock),
      instance(threeDSecureFactoryMock),
      translator,
      messageBusMock,
    );

    sut.init();
  });

  describe('init$()', () => {
    it('should initialize the 3DS SDK with provided config', (done: DoneCallback) => {
      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_INIT, data: configMock }).subscribe(result => {
        verify(threeDSecureMock.init$(configMock)).once();
        expect(result).toBe(configMock);
        done();
      });
    });
  });

  describe('run3DSMethod$', () => {
    it('should run 3DSMethod using received data', (done: DoneCallback) => {
      const methodUrlData: IMethodUrlData = {
        methodUrl: 'https://methodurl',
        transactionId: '12345',
        notificationUrl: 'https://notificationurl',
      };

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_METHOD_URL, data: methodUrlData }).subscribe(result => {
        verify(threeDSecureMock.run3DSMethod$(
          methodUrlData.transactionId,
          methodUrlData.notificationUrl,
          methodUrlData.methodUrl,
        )).once();
        expect(result).toBe(methodUrlResultMock);
        done();
      });
    });

    it('should initialize the 3DS SDK with custom translation for the cancel button', (done: DoneCallback) => {
      // @ts-ignore
      const spy = jest.spyOn(sut.threeDSecure, 'init$');
      const updatedConfig = {
        ...configMock,
        translations: {
          cancel: 'testcancel',
        },
      };
      when(threeDSecureMock.init$(anything())).thenReturn(of(updatedConfig));

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_INIT, data: updatedConfig }).subscribe(() => {
        expect(spy).toHaveBeenCalledWith(updatedConfig);

        done();
      });
    });
  });

  describe('doChallenge$', () => {
    it('should run 3DS challenge using received data', (done: DoneCallback) => {
      const challengeData: IChallengeData = {
        challengeURL: 'https://acsurl',
        payload: '1234',
        version: '2.2.0',
        cardType: CardType.VISA,
        termURL: 'https://termurl',
        merchantData: 'merchantdata',
      };

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE, data: challengeData }).subscribe(result => {
        verify(threeDSecureMock.doChallenge$(
          deepEqual(new ThreeDSecureVersion(challengeData.version)),
          challengeData.payload,
          challengeData.challengeURL,
          challengeData.cardType,
          challengeData.termURL,
          challengeData.merchantData,
        )).once();
        expect(result).toBe(challengeResultMock);
        done();
      });
    });
  });

  // EMVCo Req 172
  describe('processingScreen', () => {
    it('shows processing screen', (done: DoneCallback) => {
      // @ts-ignore
      const spy = jest.spyOn(sut.threeDSecure, 'showProcessingScreen');
      const updatedConfig = {
        ...configMock,
        translations: {
          cancel: 'testcancel',
        },
      };
      when(threeDSecureMock.init$(anything())).thenReturn(of(updatedConfig));

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW, data: configMock }).subscribe(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('hides processing screen', (done: DoneCallback) => {
      // @ts-ignore
      const spy = jest.spyOn(sut.threeDSecure, 'hideProcessingScreen');
      const updatedConfig = {
        ...configMock,
        translations: {
          cancel: 'testcancel',
        },
      };
      when(threeDSecureMock.init$(anything())).thenReturn(of(updatedConfig));

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE, data: configMock }).subscribe(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('threedCancel', () => {
    it('should call cancel method which cancels challenge process', () => {
      // @ts-ignore
      const spy = jest.spyOn(sut.threeDSecure, 'cancelChallenge$');
      when(threeDSecureMock.init$(anything())).thenReturn(of(null));

      messageBusMock.publish({ type: PUBLIC_EVENTS.THREED_CANCEL });
      expect(spy).toHaveBeenCalled();
    });
  });
});
