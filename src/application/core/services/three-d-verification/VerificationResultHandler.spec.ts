import { NotificationService } from '../../../../client/notification/NotificationService';
import { StTransport } from '../st-transport/StTransport.class';
import { VerificationResultHandler } from './VerificationResultHandler';
import { instance, mock, verify, when } from 'ts-mockito';
import { IVerificationResult } from './data/IVerificationResult';
import { ActionCode } from './data/ActionCode';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { StCodec } from '../st-codec/StCodec.class';

describe('VerificationResultHandler', () => {
  let notificationServiceMock: NotificationService;
  let transportMock: StTransport;
  let verificationResultHandler: VerificationResultHandler;

  beforeEach(() => {
    notificationServiceMock = mock(NotificationService);
    transportMock = mock(StTransport);
    verificationResultHandler = new VerificationResultHandler(
      instance(notificationServiceMock),
      instance(transportMock)
    );
  });

  it('returns response on success', done => {
    const result: IVerificationResult = {
      errorNumber: 0,
      errorDescription: '',
      validated: true,
      actionCode: ActionCode.SUCCESS,
      jwt: 'foobar'
    };
    const tokens: IThreeDSTokens = {
      cacheToken: 'aaa',
      jwt: 'bbb'
    };

    verificationResultHandler.handle(result, tokens).subscribe(response => {
      expect(response.cachetoken).toBe('aaa');
      expect(response.threedresponse).toBe('foobar');
      done();
    });
  });

  it('returns response on no-action', done => {
    const result: IVerificationResult = {
      errorNumber: 0,
      errorDescription: '',
      validated: true,
      actionCode: ActionCode.NOACTION,
      jwt: 'foobar'
    };
    const tokens: IThreeDSTokens = {
      cacheToken: 'aaa',
      jwt: 'bbb'
    };

    verificationResultHandler.handle(result, tokens).subscribe(response => {
      expect(response.cachetoken).toBe('aaa');
      expect(response.threedresponse).toBe('foobar');
      done();
    });
  });

  it('displays notification and returns error on error', done => {
    const result: IVerificationResult = {
      errorNumber: 1234,
      errorDescription: 'error occured',
      validated: false,
      actionCode: ActionCode.ERROR,
      jwt: 'foobar'
    };
    const tokens: IThreeDSTokens = {
      cacheToken: 'aaa',
      jwt: 'bbb'
    };

    verificationResultHandler.handle(result, tokens).subscribe({
      error: response => {
        expect(response).toBe(result);
        verify(notificationServiceMock.error(COMMUNICATION_ERROR_INVALID_RESPONSE)).once();
        done();
      }
    });
  });

  it('publishes error response and returns error on failure', done => {
    const result: IVerificationResult = {
      errorNumber: 1234,
      errorDescription: 'failure occured',
      validated: false,
      actionCode: ActionCode.FAILURE,
      jwt: 'foobar'
    };
    const tokens: IThreeDSTokens = {
      cacheToken: 'aaa',
      jwt: 'bbb'
    };

    spyOn(StCodec, 'publishResponse');

    when(transportMock._threeDQueryResult).thenReturn({
      response: 'foo',
      jwt: 'bar'
    });

    verificationResultHandler.handle(result, tokens).subscribe({
      error: response => {
        expect(response).toBe(result);
        expect(StCodec.publishResponse).toHaveBeenCalledWith('foo', 'bar', 'foobar');
        done();
      }
    });
  });
});
