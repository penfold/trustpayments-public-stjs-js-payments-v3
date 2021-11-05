import { HttpClient, IHttpClientResponse } from '@trustpayments/http-client';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { IStRequest } from '../../models/IStRequest';
import { IRequestObject } from '../../models/IRequestObject';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { ResponseDecoderService } from '../st-codec/ResponseDecoderService';
import { RequestEncoderService } from '../st-codec/RequestEncoderService';
import { IJwtResponse } from '../st-codec/interfaces/IJwtResponse';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { TransportService } from './TransportService';
import { IHttpOptionsProvider } from './http-options-provider/IHttpOptionsProvider';

describe('TransportService', () => {
  const request: IStRequest = instance(mock<IStRequest>());
  const requestObject: IRequestObject = instance(mock<IRequestObject>());
  const httpOptions: IHttpClientConfig = instance(mock<IHttpClientConfig>());
  const gatewayUrl = 'https://gateway.trustpayments.net';
  const response: IHttpClientResponse<IJwtResponse> = {
    status: 200,
    statusText: '',
    config: {},
    headers: {},
    data: {
      jwt: '',
    },
  };

  let requestEncoderMock: RequestEncoderService;
  let responseDecoderMock: ResponseDecoderService;
  let httpClientMock: HttpClient;
  let configProviderMock: ConfigProvider;
  let httpOptionsProviderMock: IHttpOptionsProvider;
  let messageBusMock: IMessageBus;
  let transportService: TransportService;

  beforeEach(() => {
    requestEncoderMock = mock(RequestEncoderService);
    responseDecoderMock = mock(ResponseDecoderService);
    httpClientMock = mock(HttpClient);
    configProviderMock = mock<ConfigProvider>();
    httpOptionsProviderMock = mock<IHttpOptionsProvider>();
    messageBusMock = mock<IMessageBus>();
    transportService = new TransportService(
      instance(requestEncoderMock),
      instance(responseDecoderMock),
      instance(httpClientMock),
      instance(configProviderMock),
      instance(httpOptionsProviderMock),
      instance(messageBusMock)
    );

    when(configProviderMock.getConfig$()).thenReturn(
      of({
        datacenterurl: gatewayUrl,
      })
    );
    when(requestEncoderMock.encode(request)).thenReturn(requestObject);
    when(httpOptionsProviderMock.getOptions(requestObject)).thenReturn(httpOptions);
    when(httpClientMock.post$(gatewayUrl, requestObject, httpOptions)).thenReturn(of(response));
    when(responseDecoderMock.decode(response)).thenReturn({
      responseJwt: 'responsejwt',
      updatedMerchantJwt: 'merchantjwt',
      customerOutput: {
        errorcode: '0',
        customeroutput: 'SUCCESS',
        errormessage: 'SUCCESS',
        requesttypedescription: 'FOOBAR',
        transactionstartedtimestamp: '',
      },
    });
  });

  describe('sendRequest()', () => {
    it('sends request to gateway url from config and returns response data with jwt', done => {
      transportService.sendRequest(request).subscribe(result => {
        verify(httpClientMock.post$(gatewayUrl, requestObject, httpOptions)).once();
        expect(result).toEqual({
          jwt: 'responsejwt',
          errorcode: '0',
          customeroutput: 'SUCCESS',
          errormessage: 'SUCCESS',
          requesttypedescription: 'FOOBAR',
          transactionstartedtimestamp: '',
        });
        done();
      });
    });

    it('sends request data to another url passed as argument', done => {
      const customUrl = 'https://customgateway';

      when(httpClientMock.post$(customUrl, requestObject, httpOptions)).thenReturn(of(response));

      transportService.sendRequest(request, customUrl).subscribe(() => {
        verify(httpClientMock.post$(customUrl, requestObject, httpOptions)).once();
        done();
      });
    });

    it('publishes the JWT_RESET event when response errorcode is different than 0', done => {
      when(responseDecoderMock.decode(response)).thenReturn({
        responseJwt: 'responsejwt',
        updatedMerchantJwt: 'merchantjwt',
        customerOutput: {
          errorcode: '1234',
          customeroutput: 'ERROR',
          errormessage: 'ERROR',
          requesttypedescription: 'FOOBAR',
          transactionstartedtimestamp: '',
        },
      });

      transportService.sendRequest(request).subscribe(result => {
        expect(result).toEqual({
          jwt: 'responsejwt',
          errorcode: '1234',
          customeroutput: 'ERROR',
          errormessage: 'ERROR',
          requesttypedescription: 'FOOBAR',
          transactionstartedtimestamp: '',
        });
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_RESET }))).once();
        done();
      });
    });

    it('publishes the JWT_RESET event when sending request fails', done => {
      const httpError: Error = new Error('ERROR');

      when(httpClientMock.post$(anything(), anything(), anything())).thenThrow(httpError);

      transportService.sendRequest(request).subscribe({
        error: (error: Error) => {
          expect(error).toBe(httpError);
          verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_RESET }))).once();
          done();
        },
      });
    });

    it('publishes the JWT_RESET event when response could not be decoded', done => {
      const decodeError: Error = new Error('ERROR');

      when(responseDecoderMock.decode(response)).thenThrow(decodeError);

      transportService.sendRequest(request).subscribe({
        error: (error: Error) => {
          expect(error).toBe(decodeError);
          verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_RESET }))).once();
          done();
        },
      });
    });

    it('publishes the JWT_REPLACED event when response contains a new merchants JWT', done => {
      transportService.sendRequest(request).subscribe(() => {
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_REPLACED, data: 'merchantjwt' }))).once();
        done();
      });
    });
  });
});
