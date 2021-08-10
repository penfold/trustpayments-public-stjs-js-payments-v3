import { StTransport } from '../st-transport/StTransport';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { StTransportGatewayClient } from './StTransportGatewayClient';
import { ThreeDInitRequest } from '../three-d-verification/data/ThreeDInitRequest';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IStRequest } from '../../models/IStRequest';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { ThreeDVerificationProviderName } from '../three-d-verification/data/ThreeDVerificationProviderName';
import { CardType } from '@trustpayments/3ds-sdk-js';

describe('StTransportGatewayClient', () => {
  let transportMock: StTransport;
  let messageBusMock: IMessageBus;
  let gatewayClient: StTransportGatewayClient;

  beforeEach(() => {
    transportMock = mock(StTransport);
    messageBusMock = mock<IMessageBus>();
    gatewayClient = new StTransportGatewayClient(instance(transportMock), instance(messageBusMock));
  });

  describe('jsInit', () => {
    const threeDInitRequest = new ThreeDInitRequest();
    const threeDInitResponse: IThreeDInitResponse = {
      jwt: '',
      cachetoken: 'foo',
      errorcode: '0',
      errormessage: '',
      requesttypedescription: 'JSINIT',
      threedinit: 'bar',
      transactionstartedtimestamp: '',
      threedsprovider: ThreeDVerificationProviderName.CARDINAL,
    };

    beforeEach(() => {
      when(transportMock.sendRequest(deepEqual(threeDInitRequest))).thenResolve({
        jwt: 'jwt',
        response: threeDInitResponse,
      });
    });

    it('sends jsinit request and publishes response', () => {
      gatewayClient.jsInit().subscribe(response => {
        expect(response).toBe(threeDInitResponse);
        verify(messageBusMock.publish({ type: PUBLIC_EVENTS.JSINIT_RESPONSE, data: response })).once();
      });
    });

    it('throws error when jsinit response has error code != 0', () => {
      const errorResponse = {
        ...threeDInitResponse,
        errorcode: '123',
      };

      beforeEach(() => {
        when(transportMock.sendRequest(deepEqual(threeDInitRequest))).thenResolve({
          jwt: 'jwt',
          response: errorResponse,
        });
      });

      gatewayClient.jsInit().subscribe({
        error: response => {
          expect(response).toBe(errorResponse);
          verify(messageBusMock.publish(anything())).never();
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
      threedversion: '2.1.0',
      paymenttypedescription: CardType.MASTER_CARD,
    };

    beforeEach(() => {
      when(transportMock.sendRequest(anything(), anything())).thenResolve({
        jwt: 'jwt',
        response: threeDQueryResponse,
      });
    });

    it('sends threeDQueryRequest and returns the response', () => {
      gatewayClient.threedQuery(threeDQueryRequest).subscribe(response => {
        verify(transportMock.sendRequest(deepEqual(threeDQueryRequest), undefined)).once();
        expect(response).toBe(threeDQueryResponse);
      });
    });

    it('sends threeDQueryRequest to given merchantUrl', () => {
      const merchantUrl = 'https://merchant.url';

      gatewayClient.threedQuery(threeDQueryRequest, merchantUrl).subscribe(response => {
        verify(transportMock.sendRequest(deepEqual(threeDQueryRequest), merchantUrl)).once();
        expect(response).toBe(threeDQueryResponse);
      });
    });
  });

  describe('auth()', () => {
    const authRequest: IStRequest = { pan: '1234 1234 1234 1234' };
    const authResponse: IRequestTypeResponse = {
      errorcode: '0',
      errormessage: '',
      jwt: '',
      requesttypedescription: 'AUTH',
    };

    beforeEach(() => {
      when(transportMock.sendRequest(anything(), anything())).thenResolve({
        jwt: 'jwt',
        response: authResponse,
      });
    });

    it('sends auth request and returns the response', () => {
      gatewayClient.auth(authResponse).subscribe(response => {
        verify(transportMock.sendRequest(deepEqual(authRequest), undefined)).once();
        expect(response).toBe(authResponse);
      });
    });

    it('sends auth request to given merchantUrl', () => {
      const merchantUrl = 'https://merchant.url';

      gatewayClient.auth(authRequest, merchantUrl).subscribe(response => {
        verify(transportMock.sendRequest(deepEqual(authRequest), merchantUrl)).once();
        expect(response).toBe(authResponse);
      });
    });
  });
});
