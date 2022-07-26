import { Observable, of, throwError } from 'rxjs';
import { HttpClient, IHttpClientConfig, IHttpClientResponse } from '@trustpayments/http-client';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IJwtResponse } from '../st-codec/interfaces/IJwtResponse';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../models/IStRequest';
import { ResponseDecoderService } from '../st-codec/ResponseDecoderService';
import { RequestEncoderService } from '../st-codec/RequestEncoderService';
import { IRequestObject } from '../../models/IRequestObject';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IDecodedResponse } from '../st-codec/interfaces/IDecodedResponse';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { RequestTimeoutError } from '../../../../shared/services/sentry/errors/RequestTimeoutError';
import { GatewayError } from '../st-codec/GatewayError';
import { TimeoutDetailsType } from '../../../../shared/services/sentry/constants/RequestTimeout';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { EventScope } from '../../models/constants/EventScope';
import { ISentryMessageEvent, SentryDataFields } from '../../../../shared/services/sentry/models/ISentryData';
import { IHttpOptionsProvider } from './http-options-provider/IHttpOptionsProvider';

type IBaseResponseType = IRequestTypeResponse & IJwtResponse;

@Service()
export class TransportService {
  constructor(
    private requestEncoder: RequestEncoderService,
    private responseDecoder: ResponseDecoderService,
    private httpClient: HttpClient,
    private configProvider: ConfigProvider,
    private httpOptionsProvider: IHttpOptionsProvider,
    private messageBus: IMessageBus,
    private sentryService: SentryService,
    private jwtDecoder: JwtDecoder
  ) {
  }

  sendRequest<T extends IBaseResponseType>(request: IStRequest, gatewayUrl?: string): Observable<T> {
    const gatewayUrl$: Observable<string> = gatewayUrl
      ? of(gatewayUrl)
      : this.configProvider.getConfig$().pipe(map(config => config.datacenterurl));
    const requestObject: IRequestObject = this.requestEncoder.encode(request);

    const requestId: ISentryMessageEvent = {
      name: SentryDataFields.CurrentRequestId,
      value: requestObject?.request[0]?.requestid,
    }
    this.messageBus.publish({ type: PUBLIC_EVENTS.SENTRY_DATA_UPDATED, data: requestId }, EventScope.ALL_FRAMES);

    const httpOptions: IHttpClientConfig = this.httpOptionsProvider.getOptions(requestObject);
    let resolvedUrl = '';

    return gatewayUrl$.pipe(
      tap((url: string) => {
        resolvedUrl = url;
      }),
      tap(() => {
        const decodedJwt = this.jwtDecoder.decode(requestObject?.jwt);
        // sentry filters out messages with "AUTH"
        const requestTypeMessage = `${(decodedJwt.payload as IStJwtPayload).requesttypedescriptions}`.replace('AUTH', 'A*UTH');
        this.messageBus.publish({
          type: PUBLIC_EVENTS.GATEWAY_REQUEST_SEND,
          data: {
            customMessage: `requestid: ${requestObject?.request[0]?.requestid}, requesttypedescriptions: ${requestTypeMessage}`,
          },
        }, EventScope.ALL_FRAMES);

      }),
      switchMap(url => this.httpClient.post$(url, requestObject, httpOptions)),
      map((response: IHttpClientResponse<IJwtResponse>) => this.responseDecoder.decode(response)),
      tap((response: IDecodedResponse) => {
        const { errorcode, errormessage } = response.customerOutput;
        const sentryMessageEvent: ISentryMessageEvent = {
          name: SentryDataFields.CurrentResponseId,
          value: response?.requestreference,
        }
        this.messageBus.publish({ type: PUBLIC_EVENTS.SENTRY_DATA_UPDATED, data: sentryMessageEvent }, EventScope.ALL_FRAMES);

        this.messageBus.publish({
          type: PUBLIC_EVENTS.GATEWAY_RESPONSE_RECEIVED,
          data: {
            customMessage: `errorcode: ${errorcode}, errormessage: ${errormessage}, requestreference: ${response?.requestreference}`,
          },
        }, EventScope.ALL_FRAMES);
        if (Number(errorcode) !== 0) {
          this.sentryService.sendCustomMessage(
            new GatewayError(`Gateway error - ${errormessage}`, response.customerOutput)
          );
        }
        this.handleJwtUpdates(response);
      }),
      map((response: IDecodedResponse) => ({ ...response.customerOutput, jwt: response.responseJwt } as T)),
      catchError((error: Error) => {
        if(error.message.startsWith('timeout')) {
          this.sentryService.sendCustomMessage(new RequestTimeoutError('Request timeout', {
            originalError: error,
            type: TimeoutDetailsType.GATEWAY,
            requestUrl: resolvedUrl,
          }));
        } else {
          this.sentryService.sendCustomMessage(new GatewayError(`Gateway error - ${error.message}`, error));
        }
        this.resetJwt();
        return throwError(error);
      })
    );
  }

  private handleJwtUpdates(response: IDecodedResponse): void {
    if(Number(response.customerOutput.errorcode) !== 0) {
      return this.resetJwt();
    }

    if(response.updatedMerchantJwt) {
      this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_REPLACED, data: response.updatedMerchantJwt });
    }
  }

  private resetJwt(): void {
    this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_RESET });
  }
}
