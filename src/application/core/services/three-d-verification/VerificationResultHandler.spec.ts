import { VerificationResultHandler } from './VerificationResultHandler';
import { IVerificationResult } from './data/IVerificationResult';
import { ActionCode } from './data/ActionCode';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { PAYMENT_ERROR } from '../../models/constants/Translations';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import DoneCallback = jest.DoneCallback;

describe('VerificationResultHandler', () => {
  const threeDQueryResponse: IThreeDQueryResponse = {
    errorcode: '0',
    errormessage: 'success',
    jwt: 'jwt',
    acquirertransactionreference: 'qwe',
    acquirerresponsecode: '0',
    acquirerresponsemessage: 'Test message',
    acsurl: 'https://acsurl',
    enrolled: 'Y',
    threedpayload: '3dpayload',
    transactionreference: 'ref',
    requesttypescription: 'THREEDQUERY',
  };

  let verificationResultHandler: VerificationResultHandler;

  beforeEach(() => {
    verificationResultHandler = new VerificationResultHandler();
  });

  it.each<ActionCode | DoneCallback>([ActionCode.SUCCESS, ActionCode.NOACTION])(
    'returns response on success and noaction',
    (actionCode: ActionCode, done: DoneCallback) => {
      const result: IVerificationResult = {
        errorNumber: 0,
        errorDescription: '',
        validated: true,
        actionCode: ActionCode.SUCCESS,
        jwt: 'foobar',
      };
      const tokens: IThreeDSTokens = {
        cacheToken: 'aaa',
        jwt: 'bbb',
      };

      verificationResultHandler.handle(threeDQueryResponse, result, tokens).subscribe(res => {
        expect(res).toMatchObject(threeDQueryResponse);
        expect(res.cachetoken).toBe('aaa');
        expect(res.threedresponse).toBe('foobar');
        done();
      });
    }
  );

  it('returns response on no-action', done => {
    const result: IVerificationResult = {
      errorNumber: 0,
      errorDescription: '',
      validated: true,
      actionCode: ActionCode.NOACTION,
      jwt: 'foobar',
    };
    const tokens: IThreeDSTokens = {
      cacheToken: 'aaa',
      jwt: 'bbb',
    };

    verificationResultHandler.handle(threeDQueryResponse, result, tokens).subscribe(res => {
      expect(res).toMatchObject(threeDQueryResponse);
      expect(res.cachetoken).toBe('aaa');
      expect(res.threedresponse).toBe('foobar');
      done();
    });
  });

  it.each<ActionCode | DoneCallback>([ActionCode.ERROR, ActionCode.FAILURE])(
    'returns error response on error and failure',
    (actionCode: ActionCode, done: DoneCallback) => {
      const result: IVerificationResult = {
        errorNumber: 1234,
        errorDescription: 'error occured',
        validated: false,
        actionCode: actionCode,
        jwt: 'foobar',
      };
      const tokens: IThreeDSTokens = {
        cacheToken: 'aaa',
        jwt: 'bbb',
      };

      verificationResultHandler.handle(threeDQueryResponse, result, tokens).subscribe({
        error: response => {
          expect(response).toEqual({
            jwt: 'jwt',
            acquirertransactionreference: 'qwe',
            acsurl: 'https://acsurl',
            enrolled: 'Y',
            threedpayload: '3dpayload',
            transactionreference: 'ref',
            requesttypescription: 'THREEDQUERY',
            acquirerresponsecode: '1234',
            acquirerresponsemessage: 'error occured',
            errorcode: '50003',
            errormessage: PAYMENT_ERROR,
            threedresponse: 'foobar',
            cachetoken: 'aaa',
          });
          done();
        },
      });
    }
  );
});
