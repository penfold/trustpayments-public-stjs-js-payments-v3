import { ConfigInterface, ChallengeDisplayMode, LoggingLevel } from '3ds-sdk-js';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { ThreeDSecureVerificationService } from './ThreeDSecureVerificationService';
import DoneCallback = jest.DoneCallback;

describe('ThreeDSecureVerificationService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let sut: ThreeDSecureVerificationService;

  const threeDSecureConfigMock: ConfigInterface = {
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
    loggingLevel: LoggingLevel.ERROR,
  };

  beforeAll(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    sut = new ThreeDSecureVerificationService(instance(interFrameCommunicatorMock));
  });

  describe('init()', () => {
    it('should return 3DS SDK JS config', (done: DoneCallback) => {
      const eventMock: IMessageBusEvent<null> = {
        type: PUBLIC_EVENTS.THREE_D_SECURE_SETUP,
        data: null,
      };

      when(interFrameCommunicatorMock.query(anything(), anything())).thenResolve(threeDSecureConfigMock);

      sut.init(anything()).subscribe((config: ConfigInterface) => {
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
