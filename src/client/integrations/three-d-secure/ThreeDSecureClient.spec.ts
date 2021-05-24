import { ChallengeDisplayMode, LoggingLevel, ResultActionCode } from '3ds-sdk-js';
import { Observable, of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { PAYMENT_CANCELLED } from '../../../application/core/models/constants/Translations';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { ActionCode } from '../../../application/core/services/three-d-verification/data/ActionCode';
import { IVerificationData } from '../../../application/core/services/three-d-verification/data/IVerificationData';
import { TranslationProvider } from '../../../application/core/shared/translator/TranslationProvider';
import { Translator } from '../../../application/core/shared/translator/Translator';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ThreeDSecureProvider } from './three-d-secure-provider/ThreeDSecureProvider';
import { ThreeDSecureProviderMock } from './three-d-secure-provider/ThreeDSecureProviderMock';
import { ThreeDSecureClient } from './ThreeDSecureClient';
import DoneCallback = jest.DoneCallback;

describe('ThreeDSecureClient', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let interFrameCommunicator: InterFrameCommunicator;
  let configProviderMock: ConfigProvider;
  let threeDSecureProviderMock: ThreeDSecureProvider;
  let sut: ThreeDSecureClient;
  let translator: Translator;
  let translationProvider: TranslationProvider;

  const sendMessage = (event: IMessageBusEvent): Observable<any> => {
    return (interFrameCommunicator.send(event, '') as unknown) as Observable<any>;
  };
  const communicationCallbacks: Map<string, (event: IMessageBusEvent) => any> = new Map();
  const configMock: IConfig = {
    threeDSecure: {
      loggingLevel: LoggingLevel.ALL,
      challengeDisplayMode: ChallengeDisplayMode.POPUP,
      translations: {
        "Cancel": "Cancel",
      }
    },
  };

  beforeAll(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    interFrameCommunicator = instance(interFrameCommunicatorMock);
    configProviderMock = mock<ConfigProvider>();
    threeDSecureProviderMock = new ThreeDSecureProviderMock(window);
    translationProvider = new TranslationProvider();
    translator = new Translator(translationProvider);

    when(interFrameCommunicatorMock.whenReceive(anything())).thenCall((eventType: string) => {
      return {
        thenRespond: (callback: (event: IMessageBusEvent) => Observable<any>) => {
          communicationCallbacks.set(eventType, callback);
        },
      };
    });
    when(interFrameCommunicatorMock.send(anything(), anything())).thenCall((event: IMessageBusEvent) => {
      return communicationCallbacks.get(event.type)(event);
    });
    when(configProviderMock.getConfig$()).thenReturn(of(configMock));

    sut = new ThreeDSecureClient(
      interFrameCommunicator,
      instance(configProviderMock),
      threeDSecureProviderMock,
      translator
    );
  });

  beforeEach(() => {
    sut.init();
  });

  describe('init$()', () => {
    it('should initialize the 3DS SDK with provided config', (done: DoneCallback) => {
      // @ts-ignore
      const spy = jest.spyOn(sut.threeDSecure, 'init$');

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_SETUP, data: null }).subscribe(() => {
        expect(spy).toHaveBeenCalledWith(configMock.threeDSecure);

        done();
      });
    });

    it('should initialize the 3DS SDK with custom translation for the cancel button', (done: DoneCallback) => {
      // @ts-ignore
      const spy = jest.spyOn(sut.threeDSecure, 'init$');
      const updatedConfig = {
        ...configMock,
        threeDSecure: {
          ...configMock.threeDSecure,
          translations: {
            "Cancel": "testcancel"
          }
        }
      };

      when(configProviderMock.getConfig$()).thenReturn(of(updatedConfig));

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_SETUP, data: null }).subscribe(() => {
        expect(spy).toHaveBeenCalledWith(updatedConfig.threeDSecure);

        done();
      });
    });
  });

  describe('verify()', () => {
    it(`should return cancel state when cancel event returned from 3DS SDK`, (done: DoneCallback) => {
      // @ts-ignore
      jest.spyOn(sut.threeDSecure, 'doChallenge$').mockImplementationOnce(() => of({
        status: ResultActionCode.CANCELLED,
        description: 'Cancel',
      }));
      const verificationData: IVerificationData = {
        acsUrl: 'acsUrlMock',
        payload: 'payloadMock',
        transactionId: 'transactionIdMock',
        jwt: 'jwtMock',
      };

      sendMessage({ type: PUBLIC_EVENTS.THREE_D_SECURE_VERIFY, data: verificationData }).subscribe(res => {
        expect(res).toEqual({
          actionCode: ActionCode.CANCELLED,
          errorNumber: 0,
          errorDescription: PAYMENT_CANCELLED,
        });

        done();
      });
    });
  });
});
