import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { CardType } from '@trustpayments/3ds-sdk-js';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ThreeDInitRequest } from '../three-d-verification/data/ThreeDInitRequest';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IStRequest } from '../../models/IStRequest';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { TransportService } from '../st-transport/TransportService';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IJwtResponse } from '../st-codec/interfaces/IJwtResponse';
import { ThreeDVerificationProviderName } from '../three-d-verification/data/ThreeDVerificationProviderName';
import { IApplePayValidateMerchantRequest } from '../../integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayWalletVerifyResponseBody } from '../../integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { TransportServiceGatewayClient } from './TransportServiceGatewayClient';

describe('TransportServiceGatewayClient', () => {
  let transportServiceMock: TransportService;
  let messageBusMock: IMessageBus;
  let gatewayClient: TransportServiceGatewayClient;

  beforeEach(() => {
    transportServiceMock = mock(TransportService);
    messageBusMock = mock<IMessageBus>();
    gatewayClient = new TransportServiceGatewayClient(instance(transportServiceMock), instance(messageBusMock));
  });

  describe('jsInit', () => {
    const threeDInitRequest = new ThreeDInitRequest();
    const threeDInitResponse: IThreeDInitResponse = {
      cachetoken: 'foo',
      errorcode: '0',
      errormessage: '',
      requesttypedescription: 'JSINIT',
      threedinit: 'bar',
      transactionstartedtimestamp: '',
      threedsprovider: ThreeDVerificationProviderName.CARDINAL,
      jwt: '',
    };

    beforeEach(() => {
      when(transportServiceMock.sendRequest(deepEqual(threeDInitRequest))).thenReturn(of(threeDInitResponse));
    });

    it('sends jsinit request and publishes response', done => {
      gatewayClient.jsInit().subscribe(response => {
        expect(response).toBe(threeDInitResponse);
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.JSINIT_RESPONSE, data: response }))).once();
        done();
      });
    });

    it('throws error when jsinit response has error code != 0', done => {
      const errorResponse = {
        ...threeDInitResponse,
        errorcode: '123',
      };

      when(transportServiceMock.sendRequest(deepEqual(threeDInitRequest))).thenReturn(of(errorResponse));

      gatewayClient.jsInit().subscribe({
        error: response => {
          expect(response).toBe(errorResponse);
          verify(messageBusMock.publish(anything())).never();
          done();
        },
      });
    });
  });

  describe('threedQuery', () => {
    const threeDQueryRequest: IStRequest = { pan: '1234 1234 1234 1234' };
    const threeDQueryResponse: IThreeDQueryResponse = {
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acquirertransactionreference: '',
      acsurl: '',
      enrolled: '',
      errorcode: '0',
      errormessage: '',
      jwt: '',
      requesttypedescription: 'THREEDQUERY',
      threedpayload: '',
      transactionreference: '',
      transactionstartedtimestamp: '',
      threedversion: '1.0.5',
      paymenttypedescription: CardType.MASTER_CARD,
    };

    beforeEach(() => {
      when(transportServiceMock.sendRequest(anything(), anything())).thenReturn(of(threeDQueryResponse));
    });

    it('sends threeDQueryRequest and returns the response', done => {
      gatewayClient.threedQuery(threeDQueryRequest).subscribe(response => {
        verify(transportServiceMock.sendRequest(deepEqual(threeDQueryRequest), undefined)).once();
        expect(response).toBe(threeDQueryResponse);
        done();
      });
    });

    it('sends threeDQueryRequest to given merchantUrl', done => {
      const merchantUrl = 'https://merchant.url';

      gatewayClient.threedQuery(threeDQueryRequest, merchantUrl).subscribe(response => {
        verify(transportServiceMock.sendRequest(deepEqual(threeDQueryRequest), merchantUrl)).once();
        expect(response).toBe(threeDQueryResponse);
        done();
      });
    });
  });

  describe('auth', () => {
    const authRequest: IStRequest = { pan: '1234 1234 1234 1234' };
    const authResponse: IRequestTypeResponse & IJwtResponse = {
      errorcode: '0',
      errormessage: '',
      jwt: '',
      requesttypedescription: 'AUTH',
    };

    beforeEach(() => {
      when(transportServiceMock.sendRequest(anything(), anything())).thenReturn(of(authResponse));
    });

    it('sends auth request and returns the response', done => {
      gatewayClient.threedQuery(authRequest).subscribe(response => {
        verify(transportServiceMock.sendRequest(deepEqual(authRequest), undefined)).once();
        expect(response).toBe(authResponse);
        done();
      });
    });

    it('sends auth request to given merchantUrl', done => {
      const merchantUrl = 'https://merchant.url';

      gatewayClient.auth(authRequest, merchantUrl).subscribe(response => {
        verify(transportServiceMock.sendRequest(deepEqual(authRequest), merchantUrl)).once();
        expect(response).toBe(authResponse);
        done();
      });
    });
  });

  describe('walletVerify', () => {
    const walletVerifyRequest: IApplePayValidateMerchantRequest = {
      walletmerchantid: '',
      walletrequestdomain: '',
      walletsource: '',
      walletvalidationurl: '',
    };

    const walletVerifyResponse: IApplePayWalletVerifyResponseBody = {
      errorcode: '0',
      errormessage: '',
      jwt: '',
      requesttypedescription: 'WALLETVERIFY',
      walletsource: 'APPLEPAY',
      customeroutput: '',
      walletsession: '',
      requestid: '',
      transactionstartedtimestamp: '',
    };

    beforeEach(() => {
      when(transportServiceMock.sendRequest(anything())).thenReturn(of(walletVerifyResponse));
    });

    it('sends WALLETVERIFY request and returns the response', done => {
      gatewayClient.walletVerify(walletVerifyRequest).subscribe(response => {
        verify(transportServiceMock.sendRequest(deepEqual({
          ...walletVerifyRequest,
          requesttypedescriptions: ['WALLETVERIFY'],
        }))).once();
        expect(response).toBe(walletVerifyResponse);
        done();
      });
    });
  });
});
