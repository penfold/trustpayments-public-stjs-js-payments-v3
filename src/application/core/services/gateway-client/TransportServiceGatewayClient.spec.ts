import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { ThreeDInitRequest } from '../three-d-verification/data/ThreeDInitRequest';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IStRequest } from '../../models/IStRequest';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { TransportService } from '../st-transport/TransportService';
import { TransportServiceGatewayClient } from './TransportServiceGatewayClient';
import { of } from 'rxjs';

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
    };

    beforeEach(() => {
      when(transportServiceMock.sendRequest(deepEqual(threeDQueryRequest))).thenReturn(of(threeDQueryResponse));
    });

    it('sends threeDQueryRequest and returns the response', () => {
      gatewayClient.threedQuery(threeDQueryRequest).subscribe(response => {
        expect(response).toBe(threeDQueryResponse);
      });
    });
  });
});
