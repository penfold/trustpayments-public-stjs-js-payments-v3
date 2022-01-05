import { instance, mock } from 'ts-mockito';
import { CardType } from '@trustpayments/3ds-sdk-js';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { ThreeDVerificationProviderName } from '../../data/ThreeDVerificationProviderName';
import { PAYMENT_ERROR } from '../../../../models/constants/Translations';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { Enrollment } from '../../../../models/constants/Enrollment';
import { GoogleAnalytics } from '../../../../integrations/google-analytics/GoogleAnalytics';
import { VerificationResultHandler } from './VerificationResultHandler';
import { IVerificationResult } from './data/IVerificationResult';
import { ActionCode } from './data/ActionCode';
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
    enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
    threedpayload: '3dpayload',
    transactionreference: 'ref',
    requesttypedescription: 'THREEDQUERY',
    threedversion: '',
    paymenttypedescription: CardType.MASTER_CARD,
  };
  const jsInitResponseMock: IThreeDInitResponse = {
    errorcode: '0',
    errormessage: 'Success',
    requesttypedescription: '',
    threedinit: 'threedinit',
    transactionstartedtimestamp: 'transactionstartedtimestamp',
    threedsprovider: ThreeDVerificationProviderName.CARDINAL,
    cachetoken: 'aaa',
    jwt: '',
  };

  let verificationResultHandler: VerificationResultHandler;
  let googleAnalyticsMock: GoogleAnalytics;

  beforeEach(() => {
    googleAnalyticsMock = mock(GoogleAnalytics);
    verificationResultHandler = new VerificationResultHandler(instance(googleAnalyticsMock));
  });

  it.each<ActionCode | DoneCallback>([ActionCode.SUCCESS, ActionCode.NOACTION])(
    'returns response on %s status',
    (actionCode: ActionCode, done: DoneCallback) => {
      const result: IVerificationResult = {
        errorNumber: 0,
        errorDescription: '',
        validated: true,
        actionCode: ActionCode.SUCCESS,
        jwt: 'foobar',
      };

      verificationResultHandler.handle$(threeDQueryResponse, result, jsInitResponseMock).subscribe(res => {
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

    verificationResultHandler.handle$(threeDQueryResponse, result, jsInitResponseMock).subscribe(res => {
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

      verificationResultHandler.handle$(threeDQueryResponse, result, jsInitResponseMock).subscribe({
        error: response => {
          expect(response).toEqual({
            jwt: 'jwt',
            acquirertransactionreference: 'qwe',
            acsurl: 'https://acsurl',
            enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
            threedpayload: '3dpayload',
            transactionreference: 'ref',
            requesttypedescription: 'THREEDQUERY',
            acquirerresponsecode: '1234',
            acquirerresponsemessage: 'error occured',
            errorcode: '50003',
            errormessage: PAYMENT_ERROR,
            threedresponse: 'foobar',
            cachetoken: 'aaa',
            threedversion: '',
            paymenttypedescription: CardType.MASTER_CARD,
          });
          done();
        },
      });
    }
  );
});
