import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../models/constants/EventTypes';
import { IStRequest } from '../models/IStRequest';
import { IThreeDInitResponse } from '../models/IThreeDInitResponse';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { IMessageBus } from '../shared/message-bus/IMessageBus';
import { GatewayClient } from './GatewayClient';
import { StTransport } from './st-transport/StTransport';
import { ThreeDInitRequest } from './three-d-verification/data/ThreeDInitRequest';
import { ThreeDVerificationProviderName } from './three-d-verification/data/ThreeDVerificationProviderName';
import { ThreeDLookupRequest } from './three-d-verification/implementations/trust-payments/data/ThreeDLookupRequest';
import { ICard } from '../models/ICard';
import { IThreeDLookupResponse } from '../models/IThreeDLookupResponse';
import { CustomerOutput } from '../models/constants/CustomerOutput';

describe('GatewayClient', () => {
  let transportMock: StTransport;
  let messageBusMock: IMessageBus;
  let gatewayClient: GatewayClient;

  beforeEach(() => {
    transportMock = mock(StTransport);
    messageBusMock = mock<IMessageBus>();
    gatewayClient = new GatewayClient(instance(transportMock), instance(messageBusMock));
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
      threedsprovider: ThreeDVerificationProviderName.TP,
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
      threedversion: '',
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acquirertransactionreference: '',
      acsurl: '',
      enrolled: '',
      errorcode: '0',
      errormessage: '',
      jwt: '',
      requesttypescription: 'THREEDQUERY',
      threedpayload: '',
      transactionreference: '',
    };

    beforeEach(() => {
      when(transportMock.sendRequest(deepEqual(threeDQueryRequest))).thenResolve({
        jwt: 'jwt',
        response: threeDQueryResponse,
      });
    });

    it('sends threeDQueryRequest and returns the response', () => {
      gatewayClient.threedQuery(threeDQueryRequest).subscribe(response => {
        expect(response).toBe(threeDQueryResponse);
      });
    });
  });

  describe('threedLookup()', () => {
    const card: ICard = { pan: '4111111111111111', expirydate: '12/23', securitycode: '123' };
    const request = new ThreeDLookupRequest(card.expirydate, card.pan, card.securitycode);

    it('sends ThreeDLookupRequest to the transport service and returns the response if errorcode is 0', done => {
      const expectedResponse: IThreeDLookupResponse = {
        transactionstartedtimestamp: '',
        errormessage: '',
        errorcode: '0',
        requesttypedescription: '',
        customeroutput: CustomerOutput.RESULT,
        threedstransactionid: '',
        threedmethodurl: '',
        threednotificationurl: '',
        threedversion: '',
        paymenttypedescription: 'VISA',
      };

      when(transportMock.sendRequest(deepEqual(request))).thenResolve({ response: expectedResponse });

      gatewayClient.threedLookup(card).subscribe(response => {
        expect(response).toBe(expectedResponse);
        done();
      });
    });

    it('sends ThreeDLookupRequest to the transport service and throws the error response if errorcode is not 0', done => {
      const expectedResponse: IThreeDLookupResponse = {
        transactionstartedtimestamp: '',
        errormessage: '',
        errorcode: '50003',
        requesttypedescription: '',
        customeroutput: CustomerOutput.RESULT,
        threedstransactionid: '',
        threedmethodurl: '',
        threednotificationurl: '',
        threedversion: '',
        paymenttypedescription: 'VISA',
      };

      when(transportMock.sendRequest(deepEqual(request))).thenResolve({ response: expectedResponse });

      gatewayClient.threedLookup(card).subscribe({
        error: response => {
          expect(response).toBe(expectedResponse);
          done();
        },
      });
    });
  });
});
