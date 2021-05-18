import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { VerificationResultHandler } from './VerificationResultHandler';
import { CardinalChallengeService } from './CardinalChallengeService';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { ThreeDVerificationProviderName } from '../../data/ThreeDVerificationProviderName';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IVerificationData } from './data/IVerificationData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { ActionCode } from './data/ActionCode';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { of } from 'rxjs';
import { IVerificationResult } from './data/IVerificationResult';
import { GoogleAnalytics } from '../../../../integrations/google-analytics/GoogleAnalytics';
import { Enrolled } from '../../../../models/constants/Enrolled';
import spyOn = jest.spyOn;

describe('CardinalChallengeService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let verificationResultHandlerMock: VerificationResultHandler;
  let cardinalChallengeService: CardinalChallengeService;

  const threeDQueryResponse: IThreeDQueryResponse = {
    jwt: '',
    acquirertransactionreference: '1234',
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acsurl: 'https://acsurl',
    enrolled: Enrolled.Y,
    threedpayload: 'threedpayload',
    transactionreference: '',
    requesttypescription: '',
    threedversion: '',
  };

  const jsInitResponse: IThreeDInitResponse = {
    errorcode: '0',
    errormessage: 'Success',
    requesttypedescription: '',
    threedinit: 'threedinit',
    transactionstartedtimestamp: 'transactionstartedtimestamp',
    threedsprovider: ThreeDVerificationProviderName.CARDINAL,
    cachetoken: 'cachetoken',
  };

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    verificationResultHandlerMock = mock(VerificationResultHandler);
    cardinalChallengeService = new CardinalChallengeService(
      instance(interFrameCommunicatorMock),
      instance(verificationResultHandlerMock),
    );
  });

  describe('isChallengeRequired', () => {
    it('returns true if enrolled is Y and acsurl is present', () => {
      expect(cardinalChallengeService.isChallengeRequired(threeDQueryResponse)).toBe(true);
    });

    it('returns false if enrolled is not Y', () => {
      expect(cardinalChallengeService.isChallengeRequired({
        ...threeDQueryResponse,
        enrolled: Enrolled.U,
      })).toBe(false);
    });

    it('returns false if acsurl is undefined', () => {
      expect(cardinalChallengeService.isChallengeRequired({
        ...threeDQueryResponse,
        acsurl: undefined,
      })).toBe(false);
    });
  });

  describe('runChallenge', () => {
    const verificationResult: IVerificationResult = {
      validated: true,
      actionCode: ActionCode.SUCCESS,
      errorNumber: 0,
      errorDescription: '',
    };

    const continueQueryEvent: IMessageBusEvent<IVerificationData> = {
      type: PUBLIC_EVENTS.CARDINAL_CONTINUE,
      data: {
        transactionId: '1234',
        jwt: 'threedinit',
        acsUrl: 'https://acsurl',
        payload: 'threedpayload',
      },
    };

    const finalResponse: IThreeDQueryResponse = { ...threeDQueryResponse };

    beforeEach(() => {
      when(interFrameCommunicatorMock.query(deepEqual(continueQueryEvent), MERCHANT_PARENT_FRAME)).thenResolve(verificationResult);
      when(verificationResultHandlerMock.handle$(threeDQueryResponse, verificationResult, jsInitResponse)).thenReturn(of(finalResponse));
    });

    it('sends CARDINAL_CONTINUE query to parent frame', done => {
      cardinalChallengeService.runChallenge$(threeDQueryResponse, jsInitResponse).subscribe(() => {
        verify(interFrameCommunicatorMock.query(deepEqual(continueQueryEvent), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });

    it('passes the challenge result to result handler and returns the final response', done => {
      cardinalChallengeService.runChallenge$(threeDQueryResponse, jsInitResponse).subscribe(result => {
        verify(verificationResultHandlerMock.handle$(threeDQueryResponse, verificationResult, jsInitResponse)).once();
        expect(result).toBe(finalResponse);
        done();
      });
    });

    it('sends proper google analytics event', done => {
      spyOn(GoogleAnalytics, 'sendGaData');

      cardinalChallengeService.runChallenge$(threeDQueryResponse, jsInitResponse).subscribe(() => {
        expect(GoogleAnalytics.sendGaData).toBeCalledWith('event', 'Cardinal', 'auth', 'Cardinal card authenticated');
        done();
      });
    });
  });
});
