import { StTransport } from './st-transport/StTransport.class';
import { IMessageBus } from '../shared/message-bus/IMessageBus';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { GatewayClient } from './GatewayClient';
import { ThreeDInitRequest } from './three-d-verification/data/ThreeDInitRequest';
import { IThreeDInitResponse } from '../models/IThreeDInitResponse';
import { PUBLIC_EVENTS } from '../models/constants/EventTypes';
import { IStRequest } from '../models/IStRequest';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';

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
      transactionstartedtimestamp: ''
    };

    beforeEach(() => {
      when(transportMock.sendRequest(deepEqual(threeDInitRequest))).thenResolve({
        jwt: 'jwt',
        response: threeDInitResponse
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
        errorcode: '123'
      };

      beforeEach(() => {
        when(transportMock.sendRequest(deepEqual(threeDInitRequest))).thenResolve({
          jwt: 'jwt',
          response: errorResponse
        });
      });

      gatewayClient.jsInit().subscribe({
        error: response => {
          expect(response).toBe(errorResponse);
          verify(messageBusMock.publish(anything())).never();
        }
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
      requesttypescription: 'THREEDQUERY',
      threedpayload: '',
      transactionreference: ''
    };

    beforeEach(() => {
      when(transportMock.sendRequest(deepEqual(threeDQueryRequest))).thenResolve({
        jwt: 'jwt',
        response: threeDQueryResponse
      });
    });

    it('sends threeDQueryRequest and returns the response', () => {
      gatewayClient.threedQuery(threeDQueryRequest).subscribe(response => {
        expect(response).toBe(threeDQueryResponse);
      });
    });
  });
});
