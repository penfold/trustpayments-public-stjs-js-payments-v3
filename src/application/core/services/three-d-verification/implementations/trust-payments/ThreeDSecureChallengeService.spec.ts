import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ChallengeResultHandler } from './ChallengeResultHandler';
import { ThreeDSecureChallengeService } from './ThreeDSecureChallengeService';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IChallengeData } from '../../../../../../client/integrations/three-d-secure/IChallengeData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { CardType, ChallengeResultInterface, ResultActionCode, ThreeDSecureVersion } from '@trustpayments/3ds-sdk-js';
import { of } from 'rxjs';
import { Enrollment } from '../../../../models/constants/Enrollment';

describe('ThreeDSecureChallengeService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let challengeResultHandlerMock: ChallengeResultHandler;
  let sut: ThreeDSecureChallengeService;

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    challengeResultHandlerMock = mock(ChallengeResultHandler);
    sut = new ThreeDSecureChallengeService(
      instance(interFrameCommunicatorMock),
      instance(challengeResultHandlerMock),
    );
  });

  it('sends a THREE_D_SECURE_CHALLENGE query and returns the result from handler', done => {
    const threeDQueryResponseMock: IThreeDQueryResponse = {
      jwt: '',
      acquirertransactionreference: '',
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acsurl: 'https://acsurl',
      enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
      threedpayload: '',
      transactionreference: '',
      requesttypescription: '',
      threedversion: '',
    };

    const queryEvent: IMessageBusEvent<IChallengeData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE,
      data: {
        version: threeDQueryResponseMock.threedversion as ThreeDSecureVersion,
        payload: threeDQueryResponseMock.threedpayload,
        challengeURL: threeDQueryResponseMock.acsurl,
        cardType: CardType.VISA,
      },
    };

    const challengeResultMock: ChallengeResultInterface = {
      status: ResultActionCode.SUCCESS,
      description: '',
    };

    const updatedThreeDQueryResponseMock: IThreeDQueryResponse = {
      ...threeDQueryResponseMock,
      threedresponse: 'threedresponse',
    };

    when(interFrameCommunicatorMock.query(deepEqual(queryEvent), MERCHANT_PARENT_FRAME)).thenResolve(challengeResultMock);
    when(challengeResultHandlerMock.handle$(threeDQueryResponseMock, challengeResultMock)).thenReturn(of(updatedThreeDQueryResponseMock));

    sut.doChallenge$(threeDQueryResponseMock, CardType.VISA).subscribe(result => {
      verify(interFrameCommunicatorMock.query(deepEqual(queryEvent), MERCHANT_PARENT_FRAME)).once();
      verify(challengeResultHandlerMock.handle$(threeDQueryResponseMock, challengeResultMock)).once();
      expect(result).toBe(updatedThreeDQueryResponseMock);
      done();
    });
  });
});
