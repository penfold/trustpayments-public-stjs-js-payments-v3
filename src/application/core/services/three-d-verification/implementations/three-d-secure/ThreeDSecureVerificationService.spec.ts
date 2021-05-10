import { ConfigInterface, ChallengeDisplayMode, LoggingLevel } from '3ds-sdk-js';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { IConfig } from '../../../../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { TestConfigProvider } from '../../../../../../testing/mocks/TestConfigProvider';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { GatewayClient } from '../../../GatewayClient';
import { ThreeDSecureVerificationService } from './ThreeDSecureVerificationService';
import DoneCallback = jest.DoneCallback;

describe('ThreeDSecureVerificationService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let gatewayClient: GatewayClient;
  let configProvider: TestConfigProvider;
  let sut: ThreeDSecureVerificationService;

  const threeDSecureConfigMock: ConfigInterface = {
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
    loggingLevel: LoggingLevel.ERROR,
  };

  const configMock: IConfig = {
    threeDSecure: {
      challengeDisplayMode: ChallengeDisplayMode.POPUP,
      loggingLevel: LoggingLevel.ERROR
    }
  };

  beforeAll(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    gatewayClient = mock(GatewayClient);
    configProvider = new TestConfigProvider();
    sut = new ThreeDSecureVerificationService(
      instance(interFrameCommunicatorMock),
      instance(gatewayClient),
      configProvider
    );
  });

  describe('init()', () => {
    it('should return 3DS SDK JS config', (done: DoneCallback) => {
      const eventMock: IMessageBusEvent<ConfigInterface> = {
        type: PUBLIC_EVENTS.THREE_D_SECURE_INIT,
        data: configMock.threeDSecure,
      };
      
      configProvider.setConfig(configMock);
      when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve(configMock.threeDSecure);

      sut.init().subscribe((config: ConfigInterface) => {
        expect(config).toEqual(threeDSecureConfigMock);
        verify(interFrameCommunicatorMock.query<ConfigInterface>(
          deepEqual(eventMock),
          MERCHANT_PARENT_FRAME,
        )).once();

        done();
      });
    });
  });
});
