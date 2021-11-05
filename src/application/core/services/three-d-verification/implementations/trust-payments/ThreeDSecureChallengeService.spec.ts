import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { CardType, ChallengeResultInterface, ResultActionCode } from '@trustpayments/3ds-sdk-js';
import { of } from 'rxjs';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IChallengeData } from '../../../../../../client/integrations/three-d-secure/IChallengeData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { Enrollment } from '../../../../models/constants/Enrollment';
import { environment } from '../../../../../../environments/environment';
import { ThreeDSecureChallengeService } from './ThreeDSecureChallengeService';
import { ChallengeResultHandler } from './ChallengeResultHandler';

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

  it('sends a THREE_D_SECURE_CHALLENGE V2 query and returns the result from handler', done => {
    const threeDQueryResponseMock: IThreeDQueryResponse = {
      jwt: '',
      acquirertransactionreference: '',
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acsurl: 'https://acsurl',
      enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
      threedpayload: '',
      transactionreference: '',
      requesttypedescription: '',
      threedversion: '2.2.0',
      paymenttypedescription: CardType.MASTER_CARD,
    };

    const queryEvent: IMessageBusEvent<IChallengeData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE,
      data: {
        version: threeDQueryResponseMock.threedversion,
        payload: threeDQueryResponseMock.threedpayload,
        challengeURL: threeDQueryResponseMock.acsurl,
        cardType: CardType.VISA,
      },
    };

    const challengeResultMock: ChallengeResultInterface = {
      status: ResultActionCode.SUCCESS,
      description: '',
      data: {
        cres: 'cres',
      },
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

  it('sends a THREE_D_SECURE_CHALLENGE V1 query and returns the result from handler', done => {
    const threeDQueryResponseMock: IThreeDQueryResponse = {
      jwt: '',
      acquirertransactionreference: '',
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acsurl: 'https://acsurl',
      enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
      transactionreference: '',
      requesttypedescription: '',
      threedversion: '1.0.5',
      pareq: 'pareq',
      md: 'merchantdata',
      paymenttypedescription: CardType.MASTER_CARD,
    };

    const queryEvent: IMessageBusEvent<IChallengeData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE,
      data: {
        version: threeDQueryResponseMock.threedversion,
        payload: threeDQueryResponseMock.pareq,
        challengeURL: threeDQueryResponseMock.acsurl,
        cardType: CardType.VISA,
        termURL: environment.THREEDS_TERM_URL,
        merchantData: threeDQueryResponseMock.md,
      },
    };

    const challengeResultMock: ChallengeResultInterface = {
      status: ResultActionCode.SUCCESS,
      description: '',
      data: {
        MD: threeDQueryResponseMock.md,
        PaRes: 'pares',
      },
    };

    const updatedThreeDQueryResponseMock: IThreeDQueryResponse = {
      ...threeDQueryResponseMock,
      md: 'merchantdata',
      pares: 'pares',
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
