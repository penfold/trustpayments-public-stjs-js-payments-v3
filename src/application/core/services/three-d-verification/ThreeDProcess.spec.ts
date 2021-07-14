import { IThreeDVerificationService } from './IThreeDVerificationService';
import { ThreeDSTokensProvider } from './ThreeDSTokensProvider';
import { VerificationResultHandler } from './VerificationResultHandler';
import { anything, deepEqual, instance, mock, reset, spy, verify, when } from 'ts-mockito';
import { ThreeDProcess } from './ThreeDProcess';
import { of } from 'rxjs';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { IVerificationData } from './data/IVerificationData';
import { IVerificationResult } from './data/IVerificationResult';
import { ActionCode } from './data/ActionCode';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { IGatewayClient } from '../gateway-client/IGatewayClient';

describe('ThreeDProcess', () => {
  let verificationServiceMock: IThreeDVerificationService;
  let messageBusMock: IMessageBus;
  let tokenProviderMock: ThreeDSTokensProvider;
  let gatewayClientMock: IGatewayClient;
  let verificationResultHandlerMock: VerificationResultHandler;
  let threeDProcess: ThreeDProcess;

  beforeEach(() => {
    verificationServiceMock = mock<IThreeDVerificationService>();
    messageBusMock = new SimpleMessageBus();
    tokenProviderMock = mock(ThreeDSTokensProvider);
    gatewayClientMock = mock<IGatewayClient>();
    verificationResultHandlerMock = mock(VerificationResultHandler);
    threeDProcess = new ThreeDProcess(
      instance(verificationServiceMock),
      messageBusMock,
      instance(tokenProviderMock),
      instance(gatewayClientMock),
      instance(verificationResultHandlerMock)
    );

    when(tokenProviderMock.getTokens()).thenReturn(
      of({
        jwt: 'cardinal-jwt',
        cacheToken: 'cardinal-cache-token',
      })
    );

    when(verificationServiceMock.init(anything())).thenReturn(of(undefined));
  });

  describe('init', () => {
    it('initializes 3ds verification service using tokens from token provider', done => {
      threeDProcess.init().subscribe(() => {
        verify(verificationServiceMock.init('cardinal-jwt')).once();
        done();
      });
    });

    it('unlocks the submit button', done => {
      jest.spyOn(messageBusMock, 'publish');

      threeDProcess.init().subscribe(() => {
        expect(messageBusMock.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.UNLOCK_BUTTON }, true);
        done();
      });
    });

    it('sends the GA init event', done => {
      const googleAnalyticsSpy = spy(GoogleAnalytics);
      threeDProcess.init().subscribe(() => {
        verify(googleAnalyticsSpy.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')).once();
        done();
      });
    });

    it('calls binLookup on BIN_PROCESS event from message bus', done => {
      threeDProcess.init().subscribe(() => {
        const pan = '4111111111111111';
        messageBusMock.publish({ type: PUBLIC_EVENTS.BIN_PROCESS, data: pan });
        verify(verificationServiceMock.binLookup(pan)).once();
        done();
      });
    });
  });

  describe('performThreeDQuery', () => {
    const card: ICard = {
      pan: '4111111111111111',
      expirydate: '12/23',
      securitycode: '123',
    };
    const requestTypes = ['ACCOUNTCHECK', 'THREEDQUERY'];
    const merchantData: IMerchantData = { foo: 'bar', termurl: 'https://test.com' };

    beforeEach(() => {
      threeDProcess.init().subscribe();

      when(verificationServiceMock.start(anything())).thenReturn(of(undefined));
      when(gatewayClientMock.threedQuery(anything())).thenReturn(of({ enrolled: 'U' } as IThreeDQueryResponse));
    });

    it('starts a 3ds verification session', done => {
      threeDProcess.performThreeDQuery(requestTypes, card, merchantData).subscribe(() => {
        verify(verificationServiceMock.start('cardinal-jwt')).once();
        done();
      });
    });

    it('starts a 3ds verification session with updated jwt', done => {
      reset(tokenProviderMock);
      when(tokenProviderMock.getTokens()).thenReturn(
        of({
          jwt: 'updated-cardinal-jwt',
          cacheToken: 'updated-cache-token',
        })
      );

      messageBusMock.publish({ type: PUBLIC_EVENTS.UPDATE_JWT, data: 'new-jwt' });

      threeDProcess.performThreeDQuery(requestTypes, card, merchantData).subscribe(() => {
        verify(verificationServiceMock.start('updated-cardinal-jwt')).once();
        done();
      });
    });

    it('calls threedquery request on the gateway', done => {
      const request = new ThreeDQueryRequest('cardinal-cache-token', card, merchantData);

      threeDProcess.performThreeDQuery(requestTypes, card, merchantData).subscribe(() => {
        verify(gatewayClientMock.threedQuery(deepEqual(request))).once();
        done();
      });
    });

    it('sends the GA auth event', done => {
      const googleAnalyticsSpy = spy(GoogleAnalytics);

      threeDProcess.performThreeDQuery(requestTypes, card, merchantData).subscribe(() => {
        verify(googleAnalyticsSpy.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed')).once();
        done();
      });
    });

    it('skips the 3ds verification if card enrolled status is not Y', done => {
      reset(gatewayClientMock);
      when(gatewayClientMock.threedQuery(anything())).thenReturn(
        of({
          enrolled: 'U',
          acsurl: undefined,
        } as IThreeDQueryResponse)
      );

      threeDProcess.performThreeDQuery(requestTypes, card, merchantData).subscribe(result => {
        verify(verificationServiceMock.verify(anything())).never();
        expect(result.cachetoken).toBe('cardinal-cache-token');
        expect(result.threedresponse).toBeUndefined();
        done();
      });
    });

    it('skips the 3ds verification if acsurl is undefined', done => {
      reset(gatewayClientMock);
      when(gatewayClientMock.threedQuery(anything())).thenReturn(
        of({
          enrolled: 'Y',
          acsurl: undefined,
        } as IThreeDQueryResponse)
      );

      threeDProcess.performThreeDQuery(requestTypes, card, merchantData).subscribe(result => {
        verify(verificationServiceMock.verify(anything())).never();
        expect(result.cachetoken).toBe('cardinal-cache-token');
        expect(result.threedresponse).toBeUndefined();
        done();
      });
    });

    it('runs the 3ds verification if card is enrolled (Y) and not frictionless (acsurl != undefined)', done => {
      const googleAnalyticsSpy = spy(GoogleAnalytics);

      const threedqueryResponse: IThreeDQueryResponse = {
        errorcode: '0',
        errormessage: 'success',
        jwt: 'jwt',
        requesttypedescription: 'THREEDQUERY',
        enrolled: 'Y',
        acsurl: 'https://acs.url',
        acquirerresponsecode: '0',
        acquirerresponsemessage: 'Test message',
        acquirertransactionreference: 'foobar-123',
        threedpayload: 'abc3dpayload',
        transactionreference: '',
        transactionstartedtimestamp: '',
      };

      const verificationData: IVerificationData = {
        transactionId: 'foobar-123',
        jwt: 'cardinal-jwt',
        acsUrl: 'https://acs.url',
        payload: 'abc3dpayload',
      };

      const verificationResult: IVerificationResult = {
        validated: true,
        actionCode: ActionCode.SUCCESS,
        errorNumber: 0,
        errorDescription: '',
        jwt: 'validation-result-jwt',
      };

      const finalResult: IThreeDQueryResponse = {
        ...threedqueryResponse,
        cachetoken: 'cardinal-cache-token',
        threedresponse: 'validation-result-jwt',
      };

      const cardinalTokens: IThreeDSTokens = {
        jwt: 'cardinal-jwt',
        cacheToken: 'cardinal-cache-token',
      };

      reset(gatewayClientMock);
      reset(verificationServiceMock);

      when(gatewayClientMock.threedQuery(anything())).thenReturn(of(threedqueryResponse));
      when(verificationServiceMock.start(anything())).thenReturn(of(undefined));
      when(verificationServiceMock.verify(deepEqual(verificationData))).thenReturn(of(verificationResult));
      when(verificationResultHandlerMock.handle(anything(), anything(), anything())).thenReturn(of(finalResult));

      threeDProcess.performThreeDQuery(requestTypes, card, merchantData).subscribe(result => {
        verify(verificationServiceMock.verify(deepEqual(verificationData))).once();
        verify(
          verificationResultHandlerMock.handle(
            deepEqual(threedqueryResponse),
            deepEqual(verificationResult),
            deepEqual(cardinalTokens)
          )
        ).once();
        verify(googleAnalyticsSpy.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')).once();
        expect(result.threedresponse).toBe('validation-result-jwt');
        expect(result.cachetoken).toBe('cardinal-cache-token');
        done();
      });
    });
  });
});
