import { ResultActionCode, ChallengeResultInterface } from '@trustpayments/3ds-sdk-js';
import { ChallengeResultHandler } from './ChallengeResultHandler';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import DoneCallback = jest.DoneCallback;
import { PAYMENT_CANCELLED, PAYMENT_ERROR } from '../../../../models/constants/Translations';
import { ThreeDResponseConverter } from './threedresponse-converter/ThreeDResponseConverter';
import { anything, instance, mock, when } from 'ts-mockito';

describe('ChallengeResultHandler', () => {
  let threeDResponseConverterMock: ThreeDResponseConverter;
  let challengeResultHandler: ChallengeResultHandler;

  beforeEach(() => {
    threeDResponseConverterMock = mock(ThreeDResponseConverter);
    challengeResultHandler = new ChallengeResultHandler(instance(threeDResponseConverterMock));

    when(threeDResponseConverterMock.convert(anything(), anything())).thenReturn('threedresponse');
  });

  describe('3DS V2', () => {
    const threeDQueryResponse: IThreeDQueryResponse = {
      jwt: '',
      acquirertransactionreference: '',
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acsurl: '',
      enrolled: '',
      threedpayload: 'threedpayload',
      transactionreference: '',
      requesttypescription: '',
      threedversion: '2.1.0',
    };

    const challengeResultTemplate: ChallengeResultInterface = {
      status: ResultActionCode.SUCCESS,
      description: 'description',
      data: { cres: 'cres' },
    };

    it.each<ResultActionCode | DoneCallback>([ResultActionCode.FAILURE, ResultActionCode.ERROR])(
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
              threedresponse: 'threedresponse',
              acsurl: '',
              enrolled: '',
              threedpayload: 'threedpayload',
              transactionreference: '',
              requesttypescription: '',
              threedversion: '2.1.0',
            });
            done();
          },
        });
      }
    );

    it.each<ResultActionCode | DoneCallback>([ResultActionCode.SUCCESS, ResultActionCode.NOACTION, ResultActionCode.COMPLETED])(
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
            threedresponse: 'threedresponse',
            acsurl: '',
            enrolled: '',
            threedpayload: 'threedpayload',
            transactionreference: '',
            requesttypescription: '',
            threedversion: '2.1.0',
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
            threedpayload: 'threedpayload',
            transactionreference: '',
            requesttypescription: '',
            threedversion: '2.1.0',
            isCancelled: true,
          });
          done();
        },
      });
    });
  });

  describe('3DS V1', () => {
    const threeDQueryResponse: IThreeDQueryResponse = {
      jwt: '',
      acquirertransactionreference: '',
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acsurl: '',
      enrolled: '',
      md: 'merchantdata',
      pareq: 'pareq',
      transactionreference: '',
      requesttypescription: '',
      threedversion: '1.0.5',
    };

    const challengeResultTemplate: ChallengeResultInterface = {
      status: ResultActionCode.SUCCESS,
      description: 'description',
      data: {
        MD: 'merchantdata',
        PaRes: 'pares',
      },
    };

    it.each<ResultActionCode | DoneCallback>([ResultActionCode.FAILURE, ResultActionCode.ERROR])(
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
              md: 'merchantdata',
              pares: 'pares',
              threedresponse: 'threedresponse',
              acsurl: '',
              enrolled: '',
              pareq: 'pareq',
              transactionreference: '',
              requesttypescription: '',
              threedversion: '1.0.5',
            });
            done();
          },
        });
      }
    );

    it.each<ResultActionCode | DoneCallback>([ResultActionCode.SUCCESS, ResultActionCode.NOACTION, ResultActionCode.COMPLETED])(
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
            pares: 'pares',
            acsurl: '',
            enrolled: '',
            pareq: 'pareq',
            md: 'merchantdata',
            threedresponse: 'threedresponse',
            transactionreference: '',
            requesttypescription: '',
            threedversion: '1.0.5',
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
            md: 'merchantdata',
            pareq: 'pareq',
            transactionreference: '',
            requesttypescription: '',
            threedversion: '1.0.5',
            isCancelled: true,
          });
          done();
        },
      });
    });
  });
});
