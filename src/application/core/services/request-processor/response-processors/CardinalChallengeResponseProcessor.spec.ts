import { mock, instance, when, verify, anything } from 'ts-mockito';
import { of } from 'rxjs';
import { CardinalChallengeService } from '../../three-d-verification/implementations/cardinal-commerce/CardinalChallengeService';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { RequestType } from '../../../../../shared/types/RequestType';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { CardinalChallengeResponseProcessor } from './CardinalChallengeResponseProcessor';

describe('CardinalChallengeResponseProcessor', () => {
  let challengeServiceMock: CardinalChallengeService;
  let cardinalChallengeResponseProcessor: CardinalChallengeResponseProcessor;

  const request: IStRequest = {};
  const threedQueryResponse: IThreeDQueryResponse = {
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acquirertransactionreference: '',
    acsurl: '',
    enrolled: undefined,
    jwt: '',
    paymenttypedescription: undefined,
    requesttypedescription: RequestType.THREEDQUERY,
    threedversion: '',
    transactionreference: '',
  };
  const jsInitResponse: IThreeDInitResponse = {
    jwt: '',
    threedsprovider: undefined,
  }
  const options: IRequestProcessingOptions = {
    jsInitResponse,
  };

  beforeEach(() => {
    challengeServiceMock = mock(CardinalChallengeService);
    cardinalChallengeResponseProcessor = new CardinalChallengeResponseProcessor(
      instance(challengeServiceMock),
    );
  });

  describe('process()', () => {
    it('returns unmodified response if its not THREEDQUERY', done => {
      const response = { ...threedQueryResponse, requesttypedescription: RequestType.THREEDLOOKUP };

      cardinalChallengeResponseProcessor.process(response, request, options).subscribe(result => {
        expect(result).toBe(response);
        done();
      });
    });

    it('returns unmodified response if challenge is not required', done => {
      when(challengeServiceMock.isChallengeRequired(threedQueryResponse)).thenReturn(false);

      cardinalChallengeResponseProcessor.process(threedQueryResponse, request, options).subscribe(result => {
        expect(result).toBe(threedQueryResponse);
        done();
      });
    });

    it('runs challenge process and returns modified response',  done => {
      const responseAfterChallenge: IThreeDQueryResponse = {
        ...threedQueryResponse,
        threedresponse: 'foobar',
      };

      when(challengeServiceMock.isChallengeRequired(threedQueryResponse)).thenReturn(true);
      when(challengeServiceMock.runChallenge$(anything(), anything())).thenReturn(of(responseAfterChallenge));
      cardinalChallengeResponseProcessor.process(threedQueryResponse, request, options).subscribe(result => {
        expect(result).toBe(responseAfterChallenge);
        verify(challengeServiceMock.runChallenge$(threedQueryResponse, jsInitResponse)).once();
        done();
      });
    });
  });
});
