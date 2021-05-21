import { IInitializationData } from '../../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { ThreeDVerificationProviderName } from '../../data/ThreeDVerificationProviderName';
import { CardinalCommerceVerificationService } from './CardinalCommerceVerificationService';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { PaymentEvents } from '../../../../models/constants/PaymentEvents';
import { GatewayClient } from '../../../GatewayClient';
import { ICard } from '../../../../models/ICard';
import { RequestType } from '../../../../../../shared/types/RequestType';
import { of } from 'rxjs';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { IMerchantData } from '../../../../models/IMerchantData';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { CardinalChallengeService } from './CardinalChallengeService';
import { GoogleAnalytics } from '../../../../integrations/google-analytics/GoogleAnalytics';
import { Enrollment } from '../../../../models/constants/Enrollment';
import spyOn = jest.spyOn;

describe('CardinalCommerceVerificationService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let gatewayClient: GatewayClient;
  let challengeService: CardinalChallengeService;
  let verificationService: CardinalCommerceVerificationService;

  const jsInitResponseMock: IThreeDInitResponse = {
    errorcode: '0',
    errormessage: 'Success',
    requesttypedescription: '',
    threedinit: 'threedinit',
    transactionstartedtimestamp: 'transactionstartedtimestamp',
    threedsprovider: ThreeDVerificationProviderName.CARDINAL,
    cachetoken: 'cachetoken',
  };

  const threeDQueryResponseMock: IThreeDQueryResponse = {
    jwt: '',
    acquirertransactionreference: '',
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acsurl: 'https://acsurl',
    enrolled: Enrollment.AUTHENTICATION_SUCCESSFUL,
    threedpayload: '',
    transactionreference: '',
    requesttypescription: '',
    threedversion: '',
  };

  const cardMock: ICard = {
    expirydate: '12/23',
    pan: '4111111111111111',
    securitycode: '123',
  }

  const merchantData: IMerchantData = {
    merchantData: 'merchantData',
  };

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    gatewayClient = mock(GatewayClient);
    challengeService = mock(CardinalChallengeService);
    verificationService = new CardinalCommerceVerificationService(
      instance(interFrameCommunicatorMock),
      instance(gatewayClient),
      instance(challengeService)
    );
  });

  describe('init', () => {
    it('calls init query', done => {
      const eventMock: IMessageBusEvent<IInitializationData> = {
        type: PUBLIC_EVENTS.CARDINAL_SETUP,
        data: { jwt: jsInitResponseMock.threedinit },
      };

      when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve(void 0);

      verificationService.init$(jsInitResponseMock).subscribe(() => {
        verify(interFrameCommunicatorMock.query(
          deepEqual(eventMock),
          MERCHANT_PARENT_FRAME,
        )).once();

        done();
      });
    });
  });

  describe('binLookup', () => {
    it('calls bin process query', done => {
      when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve(void 0);

      const pan = '4111111111111111';

      verificationService.binLookup$(pan).subscribe(() => {
        const event = {
          type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
          data: {
            eventName: PaymentEvents.BIN_PROCESS,
            data: pan,
          },
        };
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('start', () => {
    const threeDQueryRequest = new ThreeDQueryRequest('cachetoken', cardMock, merchantData);

    beforeEach(() => {
      when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve(void 0);
      when(gatewayClient.threedQuery(deepEqual(threeDQueryRequest))).thenReturn(of(threeDQueryResponseMock));
      when(challengeService.isChallengeRequired(anything())).thenReturn(false);
    })

    it('calls start query if THREEDQUERY is present in requestTypes', done => {
      const event = {
        type: PUBLIC_EVENTS.CARDINAL_START,
        data: { jwt: 'threedinit' },
      };

      verificationService.start$(
        jsInitResponseMock,
        [RequestType.THREEDQUERY],
        cardMock,
        merchantData,
      ).subscribe(() => {
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });

    it('does not call start query if THREEDQUERY is not present in requestTypes', done => {
      const event = {
        type: PUBLIC_EVENTS.CARDINAL_START,
        data: { jwt: 'threedinit' },
      };

      verificationService.start$(
        jsInitResponseMock,
        [RequestType.ACCOUNTCHECK],
        cardMock,
        merchantData,
      ).subscribe(() => {
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).never();
        done();
      });
    });

    it('sends the THREEDQUERY request to the gateway', done => {
      verificationService.start$(
        jsInitResponseMock,
        [RequestType.THREEDQUERY],
        cardMock,
        merchantData,
      ).subscribe(() => {
        verify(gatewayClient.threedQuery(deepEqual(threeDQueryRequest))).once();
        done();
      });
    });

    it('skips the challenge and returns the TDQ response if challenge is not required', done => {
      when(challengeService.isChallengeRequired(deepEqual(threeDQueryResponseMock))).thenReturn(false);

      verificationService.start$(
        jsInitResponseMock,
        [RequestType.THREEDQUERY],
        cardMock,
        merchantData,
      ).subscribe((result) => {
        verify(challengeService.runChallenge$(anything(), anything())).never();
        expect(result).toEqual({
          ...threeDQueryResponseMock,
          cachetoken: 'cachetoken',
        });
        done();
      });
    });

    it('runs the challenge if required and returns the updated response', done => {
      const updatedThreeDQueryResponse = {
        ...threeDQueryResponseMock,
        threedresponse: 'foobar',
      };

      when(challengeService.isChallengeRequired(deepEqual(threeDQueryResponseMock))).thenReturn(true);
      when(challengeService.runChallenge$(deepEqual(threeDQueryResponseMock), jsInitResponseMock)).thenReturn(of(updatedThreeDQueryResponse));

      verificationService.start$(
        jsInitResponseMock,
        [RequestType.THREEDQUERY],
        cardMock,
        merchantData,
      ).subscribe((result) => {
        expect(result).toBe(updatedThreeDQueryResponse);
        done();
      });
    });

    it('sends proper google analytics event', done => {
      spyOn(GoogleAnalytics, 'sendGaData');

      verificationService.start$(
        jsInitResponseMock,
        [RequestType.THREEDQUERY],
        cardMock,
        merchantData,
      ).subscribe(() => {
        expect(GoogleAnalytics.sendGaData).toHaveBeenCalledWith('event', 'Cardinal', 'auth', 'Cardinal auth completed');
        done();
      });
    });
  });
});
