import { ChallengeDisplayMode, ConfigInterface, LoggingLevel, ResultActionCode, ThreeDSecureInterface, ThreeDSecureVersion } from '3ds-sdk-js';
import { Observable, of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ThreeDSecureProvider } from './three-d-secure-provider/ThreeDSecureProvider';
import { ThreeDSecureClient } from './ThreeDSecureClient';
import DoneCallback = jest.DoneCallback;
import { IMethodUrlData } from './IMethodUrlData';
import { IChallengeData } from './IChallengeData';

describe('ThreeDSecureClient', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let threeDSecureProviderMock: ThreeDSecureProvider;
  let threeDSecureMock: ThreeDSecureInterface;
  let sut: ThreeDSecureClient;
  let communicationCallbacks: Map<string, (event: IMessageBusEvent) => any>;

  const sendMessage = <T>(event: IMessageBusEvent): Observable<T> => {
    return communicationCallbacks.get(event.type)(event);
  };

  const configMock: ConfigInterface = {
    loggingLevel: LoggingLevel.ALL,
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
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
    threeDSecureProviderMock = mock(ThreeDSecureProvider);
    threeDSecureMock = mock<ThreeDSecureInterface>();
    communicationCallbacks = new Map();

    when(interFrameCommunicatorMock.whenReceive(anything())).thenCall((eventType: string) => {
      return {
        thenRespond: (callback: (event: IMessageBusEvent) => Observable<any>) => {
          communicationCallbacks.set(eventType, callback);
        },
      };
    });

    when(threeDSecureProviderMock.getSdk()).thenReturn(instance(threeDSecureMock));
    when(threeDSecureMock.init$(anything())).thenReturn(of(configMock));
    when(threeDSecureMock.run3DSMethod$(anything(), anything(), anything())).thenReturn(of(methodUrlResultMock));
    when(threeDSecureMock.doChallenge$(anything(), anything(), anything())).thenReturn(of(challengeResultMock));
    when(threeDSecureMock.getBrowserData()).thenReturn(browserDataMock);

    sut = new ThreeDSecureClient(
      instance(interFrameCommunicatorMock),
      instance(threeDSecureProviderMock),
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
          methodUrlData.notificationUrl,
          methodUrlData.transactionId,
          methodUrlData.methodUrl,
        )).once();
        expect(result).toBe(methodUrlResultMock);
        done();
      });
    });
  });

  describe('doChallenge$', () => {
    it('should run 3DS challenge using received data', (done: DoneCallback) => {
      const challengeData: IChallengeData = {
        challengeURL: 'https://acsurl',
        payload: '1234',
        version: ThreeDSecureVersion.v2_2,
      };

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE, data: challengeData }).subscribe(result => {
        verify(threeDSecureMock.doChallenge$(
          challengeData.version,
          challengeData.payload,
          challengeData.challengeURL,
        )).once();
        expect(result).toBe(challengeResultMock);
        done();
      });
    });
  });

});
