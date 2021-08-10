import { anything, instance, mock, verify, when } from 'ts-mockito';
import { ThreeDSecureChallengeService } from '../../three-d-verification/implementations/trust-payments/ThreeDSecureChallengeService';
import { TPChallengeResponseProcessor } from './TPChallengeResponseProcessor';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';
import { RequestType } from '../../../../../shared/types/RequestType';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { CardType } from '@trustpayments/3ds-sdk-js';
import { of } from 'rxjs';

describe('TPChallengeResponseProcessor', () => {
  let challengeServiceMock: ThreeDSecureChallengeService;
  let challengeResponseProcessor: TPChallengeResponseProcessor;

  const request: IStRequest = {};
  const options: IRequestProcessingOptions = {
    jsInitResponse: undefined,
  }

  const tdqResponse: IThreeDQueryResponse = {
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acquirertransactionreference: '',
    acsurl: 'https://acsurl',
    enrolled: undefined,
    jwt: '',
    paymenttypedescription: CardType.MASTER_CARD,
    requesttypedescription: RequestType.THREEDQUERY,
    threedversion: '',
    transactionreference: '',
  }

  beforeEach(() => {
    challengeServiceMock = mock(ThreeDSecureChallengeService);
    challengeResponseProcessor = new TPChallengeResponseProcessor(
      instance(challengeServiceMock),
    );
  });

  describe('process()', () => {
    it('returns unmodified response if not a THREEDQUERY response', done => {
      const response = { ...tdqResponse, requesttypedescription: RequestType.AUTH };
      challengeResponseProcessor.process(response, request, options).subscribe(result => {
        expect(result).toBe(response);
        done();
      });
    });

    it('returns unmodified response if there is no acsurl in the response', done => {
      const response = { ...tdqResponse, acsurl: undefined };
      challengeResponseProcessor.process(response, request, options).subscribe(result => {
        expect(result).toBe(response);
        done();
      });
    });

    it('runs the challenge process and returns the modified response', done => {
      const challengeResponse = { ...tdqResponse, threedresponse: 'threedresponse' };

      when(challengeServiceMock.doChallenge$(anything(), anything())).thenReturn(of(challengeResponse));

      challengeResponseProcessor.process(tdqResponse, request, options).subscribe(result => {
        expect(result).toBe(challengeResponse);
        verify(challengeServiceMock.doChallenge$(tdqResponse, CardType.MASTER_CARD)).once();
        done();
      });
    });
  });
});
