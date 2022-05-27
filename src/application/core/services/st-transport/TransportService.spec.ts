import { HttpClient, IHttpClientResponse } from '@trustpayments/http-client';
import { anything, capture, deepEqual, instance, mock, resetCalls, spy, verify, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { IStRequest } from '../../models/IStRequest';
import { IRequestObject } from '../../models/IRequestObject';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { ResponseDecoderService } from '../st-codec/ResponseDecoderService';
import { RequestEncoderService } from '../st-codec/RequestEncoderService';
import { IJwtResponse } from '../st-codec/interfaces/IJwtResponse';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { RequestTimeoutError } from '../../../../shared/services/sentry/errors/RequestTimeoutError';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { GatewayError } from '../st-codec/GatewayError';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { EventScope } from '../../models/constants/EventScope';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { TransportService } from './TransportService';
import { IHttpOptionsProvider } from './http-options-provider/IHttpOptionsProvider';

describe('TransportService', () => {
  const request: IStRequest = instance(mock<IStRequest>());
  const requestObject: IRequestObject = {
    acceptcustomeroutput: 'test',
    jwt: 'test',
    request: [{
      requestid: 'test-123',
    }],
    version: 'test',
    versioninfo: 'test',
  };
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
  const messageBus = new SimpleMessageBus();
  let transportService: TransportService;
  let sentryServiceMock: SentryService;
  let jwtDecoderMock: JwtDecoder;
  const messageBusSpied = spy(messageBus)

  beforeEach(() => {
    requestEncoderMock = mock(RequestEncoderService);
    responseDecoderMock = mock(ResponseDecoderService);
    httpClientMock = mock(HttpClient);
    configProviderMock = mock<ConfigProvider>();
    httpOptionsProviderMock = mock<IHttpOptionsProvider>();
    sentryServiceMock = mock(SentryService);
    jwtDecoderMock = mock(JwtDecoder);
    transportService = new TransportService(
      instance(requestEncoderMock),
      instance(responseDecoderMock),
      instance(httpClientMock),
      instance(configProviderMock),
      instance(httpOptionsProviderMock),
      messageBus,
      instance(sentryServiceMock),
      instance(jwtDecoderMock),
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
      requestreference: 'test',
      customerOutput: {
        errorcode: '0',
        customeroutput: 'SUCCESS',
        errormessage: 'SUCCESS',
        requesttypedescription: 'FOOBAR',
        transactionstartedtimestamp: '',
      },
    });
    when(jwtDecoderMock.decode(anything())).thenReturn({
      payload: {
        requesttypedescriptions: ['AUTH'],
      },
    });
  });

  afterEach(() => {
    resetCalls(messageBusSpied);
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

    it('adds sentry breadcrumbs on request and response', done => {
      transportService.sendRequest(request).subscribe(() => {
        verify(messageBusSpied.publish(deepEqual({
          type: PUBLIC_EVENTS.GATEWAY_REQUEST_SEND,
          data: {
            customMessage: 'requestid: test-123, requesttypedescriptions: A*UTH',
          },
        }), EventScope.ALL_FRAMES)).once();
        verify(messageBusSpied.publish(deepEqual({
          type: PUBLIC_EVENTS.GATEWAY_RESPONSE_RECEIVED,
          data: {
            customMessage: 'errorcode: 0, errormessage: SUCCESS, requestreference: test',
          },
        }), EventScope.ALL_FRAMES)).once();
        done();
      });
    });

    it('should publish SENTRY_DATA_UPDATED event with requestId', done => {
      transportService.sendRequest(request).subscribe(() => {
        const sentryRequestEvent = capture(messageBusSpied.publish).first()

        expect(sentryRequestEvent).toContainEqual({
          data: {
            name: 'currentRequestId',
            value: 'test-123',
          },
          type:  PUBLIC_EVENTS.SENTRY_DATA_UPDATED,
        })
        done();
      });
    });

    it('should publish SENTRY_DATA_UPDATED event with responseId', done => {
      transportService.sendRequest(request).subscribe(() => {
        const sentryRequestEvent = capture(messageBusSpied.publish).third()

        expect(sentryRequestEvent).toContainEqual({
          data: {
            name: 'currentResponseId',
            value: 'test',
          },
          type:  PUBLIC_EVENTS.SENTRY_DATA_UPDATED,
        })
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
        requestreference: 'test',
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
        verify(messageBusSpied.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_RESET }))).once();
        done();
      });
    });

    it('publishes the JWT_RESET event when sending request fails', done => {
      const httpError: Error = new Error('ERROR');

      when(httpClientMock.post$(anything(), anything(), anything())).thenThrow(httpError);

      transportService.sendRequest(request).subscribe({
        error: (error: Error) => {
          expect(error).toBe(httpError);
          verify(messageBusSpied.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_RESET }))).once();
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
          verify(messageBusSpied.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_RESET }))).once();
          done();
        },
      });
    });

    it('publishes the JWT_REPLACED event when response contains a new merchants JWT', done => {
      transportService.sendRequest(request).subscribe(() => {
        verify(messageBusSpied.publish(deepEqual({ type: PUBLIC_EVENTS.JWT_REPLACED, data: 'merchantjwt' }))).once();
        done();
      });
    });

    it('sends timeout error to sentry', done => {
      const httpError: Error = new Error('timeout');

      when(httpClientMock.post$(anything(), anything(), anything())).thenReturn(throwError(() => httpError));

      transportService.sendRequest(request).subscribe({
        error: (error: Error) => {
          expect(error).toBe(httpError);
          verify(sentryServiceMock.sendCustomMessage(deepEqual(new RequestTimeoutError('Request timeout', { originalError: error })))).once();
          done();
        },
      });
    });

    it('sends other gateway errors to sentry', done => {
      const httpError: Error = new Error('other');

      when(httpClientMock.post$(anything(), anything(), anything())).thenReturn(throwError(() => httpError));

      transportService.sendRequest(request).subscribe({
        error: (error: Error) => {
          expect(error).toBe(httpError);
          verify(sentryServiceMock.sendCustomMessage(deepEqual(new GatewayError('Gateway error - other', error)))).once();
          done();
        },
      });
    });

    it('sends gateway responses to sentry if errorcode != 0', done => {
      const errorResponse = {
        responseJwt: 'responsejwt',
        updatedMerchantJwt: 'merchantjwt',
        requestreference: 'test',
        customerOutput: {
          errorcode: '1234',
          customeroutput: 'ERROR',
          errormessage: 'ERROR',
          requesttypedescription: 'FOOBAR',
          transactionstartedtimestamp: '',
        },
      };

      when(responseDecoderMock.decode(response)).thenReturn(errorResponse);

      transportService.sendRequest(request).subscribe(() => {
        verify(sentryServiceMock.sendCustomMessage(deepEqual(new GatewayError('Gateway error - ERROR', errorResponse)))).once();
        done();
      });
    });
  });
});
