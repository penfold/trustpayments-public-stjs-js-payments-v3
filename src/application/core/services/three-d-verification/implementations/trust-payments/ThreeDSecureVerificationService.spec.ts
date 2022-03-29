import {
  CardType,
  ChallengeDisplayMode,
  ConfigInterface,
  LoggingLevel,
  ResultActionCode,
} from '@trustpayments/3ds-sdk-js';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { EMPTY, of } from 'rxjs';
import { IConfig } from '../../../../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { TestConfigProvider } from '../../../../../../testing/mocks/TestConfigProvider';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IMessageBus } from '../../../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../../shared/message-bus/SimpleMessageBus';
import { ICard } from '../../../../models/ICard';
import { IMerchantData } from '../../../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { ThreeDVerificationProviderName } from '../../data/ThreeDVerificationProviderName';
import { RequestType } from '../../../../../../shared/types/RequestType';
import { IThreeDLookupResponse } from '../../../../models/IThreeDLookupResponse';
import { Enrollment } from '../../../../models/constants/Enrollment';
import { CustomerOutput } from '../../../../models/constants/CustomerOutput';
import { IGatewayClient } from '../../../gateway-client/IGatewayClient';
import { ThreeDQueryRequest } from './data/ThreeDQueryRequest';
import { ThreeDSecureMethodService } from './ThreeDSecureMethodService';
import { BrowserDataProvider } from './BrowserDataProvider';
import { ThreeDSecureChallengeService } from './ThreeDSecureChallengeService';
import { ThreeDSecureVerificationService } from './ThreeDSecureVerificationService';
import { ThreeDLookupRequest } from './data/ThreeDLookupRequest';
import DoneCallback = jest.DoneCallback;

describe('ThreeDSecureVerificationService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let gatewayClient: IGatewayClient;
  let configProvider: TestConfigProvider;
  let threeDSMethodService: ThreeDSecureMethodService;
  let browserDataProvider: BrowserDataProvider;
  let challengeService: ThreeDSecureChallengeService;
  let messageBus: IMessageBus;
  let sut: ThreeDSecureVerificationService;

  const threeDSecureConfigMock: ConfigInterface = {
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
    loggingLevel: LoggingLevel.ERROR,
  };

  const configMock: IConfig = {
    threeDSecure: { ...threeDSecureConfigMock },
  };

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    gatewayClient = mock<IGatewayClient>();
    threeDSMethodService = mock(ThreeDSecureMethodService);
    browserDataProvider = mock(BrowserDataProvider);
    challengeService = mock(ThreeDSecureChallengeService);
    configProvider = new TestConfigProvider();
    messageBus = new SimpleMessageBus();
    sut = new ThreeDSecureVerificationService(
      instance(interFrameCommunicatorMock),
      instance(gatewayClient),
      configProvider,
      instance(threeDSMethodService),
      instance(browserDataProvider),
      instance(challengeService),
      messageBus,
    );

    configProvider.setConfig(configMock);
  });

  describe('init()', () => {
    it('should send THREE_D_SECURE_INIT query event to parent frame and return config', (done: DoneCallback) => {
      const eventMock: IMessageBusEvent<ConfigInterface> = {
        type: PUBLIC_EVENTS.THREE_D_SECURE_INIT,
        data: threeDSecureConfigMock,
      };

      when(interFrameCommunicatorMock.query(deepEqual(eventMock), MERCHANT_PARENT_FRAME)).thenResolve(threeDSecureConfigMock);

      sut.init$().subscribe(result => {
        expect(result).toBe(threeDSecureConfigMock);
        verify(interFrameCommunicatorMock.query<ConfigInterface>(
          deepEqual(eventMock),
          MERCHANT_PARENT_FRAME,
        )).once();

        done();
      });
    });
  });

  describe('binLookup()', () => {
    it('should return empty observable', () => {
      expect(sut.binLookup$()).toEqual(EMPTY);
    });
  });

  describe('start()', () => {
    const card: ICard = {
      pan: '4111111111111111',
      expirydate: '12/23',
      securitycode: '123',
    };
    const merchantData: IMerchantData = {
      foo: 'bar',
    };
    const jsInitResponseMock: IThreeDInitResponse = {
      errorcode: '0',
      errormessage: 'Success',
      requesttypedescription: 'JSINIT',
      transactionstartedtimestamp: 'transactionstartedtimestamp',
      threedsprovider: ThreeDVerificationProviderName.TP,
      jwt: '',
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
      requesttypedescription: '',
      threedversion: '',
      paymenttypedescription: CardType.MASTER_CARD,
    };
    const updatedThreeDQueryResponseMock: IThreeDQueryResponse = {
      ...threeDQueryResponseMock,
      threedresponse: 'threedresponse',
    };
    const threedLookupResponse: IThreeDLookupResponse = {
      jwt: '',
      transactionstartedtimestamp: '',
      errormessage: '',
      errorcode: '',
      requesttypedescription: 'THREEDLOOKUP',
      customeroutput: CustomerOutput.RESULT,
      threedstransactionid: '12345',
      threedmethodurl: 'https://methodurl',
      threednotificationurl: 'https://methodurlnotification',
      threedversion: '2.1.0',
      paymenttypedescription: 'VISA',
    };
    const browserDataMock = {
      accept: '',
      browserjavaenabled: '',
      browserjavascriptenabled: '',
      browserlanguage: '',
      browserscreenwidth: '',
      browserscreenheight: '',
      browsercolordepth: '',
      browsertz: '',
      useragent: '',
      customerip: '',
    };
    const tdqRequestWithoutBrowserData = new ThreeDQueryRequest(card, merchantData);
    const tdqRequestWithBrowserData = new ThreeDQueryRequest(card, merchantData, browserDataMock);
    const processingScreenShowEventMock: IMessageBusEvent<string> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW,
      data: CardType.VISA,
    };
    const processingScreenHideEventMock: IMessageBusEvent<string> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
    };

    beforeEach(() => {
      when(gatewayClient.threedQuery(deepEqual(tdqRequestWithoutBrowserData))).thenReturn(of(threeDQueryResponseMock));
      when(gatewayClient.threedQuery(deepEqual(tdqRequestWithBrowserData))).thenReturn(of(threeDQueryResponseMock));
      when(gatewayClient.threedLookup(anything())).thenReturn(of(threedLookupResponse));
      when(threeDSMethodService.perform3DSMethod$(
        threedLookupResponse.threedmethodurl,
        threedLookupResponse.threednotificationurl,
        threedLookupResponse.threedstransactionid,
      )).thenReturn(of({
        status: ResultActionCode.SUCCESS,
        description: '',
        transactionId: threedLookupResponse.threedstransactionid,
      }));
      when(browserDataProvider.getBrowserData$()).thenReturn(of(browserDataMock));
      when(challengeService.doChallenge$(threeDQueryResponseMock, threedLookupResponse.paymenttypedescription as CardType)).thenReturn(of(updatedThreeDQueryResponseMock));
      when(interFrameCommunicatorMock.query(deepEqual(processingScreenShowEventMock), MERCHANT_PARENT_FRAME)).thenResolve(void 0);
      when(interFrameCommunicatorMock.query(deepEqual(processingScreenHideEventMock), MERCHANT_PARENT_FRAME)).thenResolve(void 0);
    });

    it('only sends gateway request and returns response if THREEDQUERY request type is not present', done => {
      sut.start$(jsInitResponseMock, [RequestType.ACCOUNTCHECK], card, merchantData).subscribe(result => {
        expect(result).toBe(threeDQueryResponseMock);
        verify(gatewayClient.threedLookup(anything())).never();
        verify(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).never();
        done();
      });
    });

    it('runs THREEDLOOKUP request on the gateway', done => {
      sut.start$(jsInitResponseMock, [RequestType.THREEDQUERY], card, merchantData).subscribe(() => {
        verify(gatewayClient.threedLookup(deepEqual(new ThreeDLookupRequest(card)))).once();
        done();
      });
    });

    it('runs TDQ request on the gateway', done => {
      sut.start$(jsInitResponseMock, [RequestType.THREEDQUERY], card, merchantData).subscribe(() => {
        verify(gatewayClient.threedQuery(deepEqual(tdqRequestWithBrowserData))).once();
        done();
      });
    });

    it('runs the challenge and returns its result if acsurl is not undefined', done => {
      sut.start$(jsInitResponseMock, [RequestType.THREEDQUERY], card, merchantData).subscribe(result => {
        verify(challengeService.doChallenge$(threeDQueryResponseMock, threedLookupResponse.paymenttypedescription as CardType)).once();
        expect(result).toBe(updatedThreeDQueryResponseMock);
        done();
      });
    });

    it('does not run the challenge if acsurl is undefined', done => {
      const threeDQueryResponseWithoutAcsUrl: IThreeDQueryResponse = {
        ...threeDQueryResponseMock,
        acsurl: undefined,
      };

      when(gatewayClient.threedQuery(deepEqual(tdqRequestWithBrowserData))).thenReturn(of(threeDQueryResponseWithoutAcsUrl));

      sut.start$(jsInitResponseMock, [RequestType.THREEDQUERY], card, merchantData).subscribe(result => {
        verify(challengeService.doChallenge$(anything(), anything())).never();
        expect(result).toBe(threeDQueryResponseWithoutAcsUrl);
        done();
      });
    });

    it('sends processing screen hide event on TRANSACTION_COMPLETE', done => {
      sut.start$(jsInitResponseMock, [RequestType.THREEDQUERY], card, merchantData).subscribe();

      messageBus.publish({
        type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
        data: {},
      });

      setTimeout(() => {
        verify(interFrameCommunicatorMock.query(
          deepEqual({
            type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
          }),
          MERCHANT_PARENT_FRAME,
        )).once();
        done();
      }, 2000);
    });

    // EMVCo Req 172
    it('opens processing screen', done => {
      sut.start$(jsInitResponseMock, [RequestType.THREEDQUERY], card, merchantData).subscribe(() => {
        verify(interFrameCommunicatorMock.query<ConfigInterface>(
          deepEqual(processingScreenShowEventMock),
          MERCHANT_PARENT_FRAME,
        )).once();
        done();
      });
    });

    // EMVCo Req 172
    it('closes processing screen', done => {
      sut.start$(jsInitResponseMock, [RequestType.THREEDQUERY], card, merchantData).subscribe(() => {
        verify(interFrameCommunicatorMock.query<ConfigInterface>(
          deepEqual(processingScreenHideEventMock),
          MERCHANT_PARENT_FRAME,
        )).once();
        done();
      });
    });
  });
});
