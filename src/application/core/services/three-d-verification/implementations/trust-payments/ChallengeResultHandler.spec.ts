import { ResultActionCode, ChallengeResultInterface } from '3ds-sdk-js';
import { ChallengeResultHandler } from './ChallengeResultHandler';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import DoneCallback = jest.DoneCallback;
import { PAYMENT_CANCELLED, PAYMENT_ERROR } from '../../../../models/constants/Translations';

describe('ChallengeResultHandler', () => {
  const threeDQueryResponse: IThreeDQueryResponse = {
    jwt: '',
    acquirertransactionreference: '',
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acsurl: '',
    enrolled: '',
    threedpayload: '',
    transactionreference: '',
    requesttypescription: '',
    threedversion: '',
  };

  const challengeResultTemplate: ChallengeResultInterface = {
    status: ResultActionCode.SUCCESS,
    description: 'description',
    data: 'foobar',
  };

  let challengeResultHandler: ChallengeResultHandler;

  beforeEach(() => {
    challengeResultHandler = new ChallengeResultHandler();
  });

  it.each<any>([ResultActionCode.FAILURE, ResultActionCode.ERROR])(
    'returns an error response on %s status',
    (resultActionCode: ResultActionCode, done: DoneCallback) => {
      const challengeResult: ChallengeResultInterface = {
        ...challengeResultTemplate,
        status: resultActionCode,
      };

      challengeResultHandler.handle$(threeDQueryResponse, challengeResult).subscribe({
        error: (result) => {
          expect(result).toEqual({
            jwt: '',
            acquirertransactionreference: '',
            acquirerresponsecode: '',
            acquirerresponsemessage: 'description',
            errorcode: '50003',
            errormessage: PAYMENT_ERROR,
            threedresponse: 'foobar',
            acsurl: '',
            enrolled: '',
            threedpayload: '',
            transactionreference: '',
            requesttypescription: '',
            threedversion: '',
          });
          done();
        },
      });
    }
  );

  it.each<any>([ResultActionCode.SUCCESS, ResultActionCode.NOACTION, ResultActionCode.COMPLETED])(
    'returns an successful response on %s status',
    (resultActionCode: ResultActionCode, done: DoneCallback) => {
      const challengeResult: ChallengeResultInterface = {
        ...challengeResultTemplate,
        status: resultActionCode,
      };

      challengeResultHandler.handle$(threeDQueryResponse, challengeResult).subscribe(result => {
        expect(result).toEqual({
          jwt: '',
          acquirertransactionreference: '',
          acquirerresponsecode: '',
          acquirerresponsemessage: '',
          threedresponse: 'foobar',
          acsurl: '',
          enrolled: '',
          threedpayload: '',
          transactionreference: '',
          requesttypescription: '',
          threedversion: '',
        });
        done();
      });
    }
  );

  it('returns a cancelled response on CANCELLED status', (done: DoneCallback) => {
    const challengeResult: ChallengeResultInterface = {
      ...challengeResultTemplate,
      status: ResultActionCode.CANCELLED,
    };

    challengeResultHandler.handle$(threeDQueryResponse, challengeResult).subscribe({
      error: (result) => {
        expect(result).toEqual({
          jwt: '',
          acquirertransactionreference: '',
          acquirerresponsecode: '',
          acquirerresponsemessage: '',
          errorcode: '0',
          errormessage: PAYMENT_CANCELLED,
          acsurl: '',
          enrolled: '',
          threedpayload: '',
          transactionreference: '',
          requesttypescription: '',
          threedversion: '',
          isCancelled: true,
        });
        done();
      },
    });
  });
});
