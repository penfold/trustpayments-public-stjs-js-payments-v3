import { Observable, of, throwError } from 'rxjs';
import { HttpClient, IHttpClientResponse } from '@trustpayments/http-client';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IHttpClientConfig } from '@trustpayments/http-client';
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
import { RequestTimeoutError } from '../../../../shared/services/sentry/RequestTimeoutError';
import { TimeoutDetailsType } from '../../../../shared/services/sentry/RequestTimeout';
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
  ) {}

  sendRequest<T extends IBaseResponseType>(request: IStRequest, gatewayUrl?: string): Observable<T> {
    const gatewayUrl$: Observable<string> = gatewayUrl
      ? of(gatewayUrl)
      : this.configProvider.getConfig$().pipe(map(config => config.datacenterurl));
    const requestObject: IRequestObject = this.requestEncoder.encode(request);
    const httpOptions: IHttpClientConfig = this.httpOptionsProvider.getOptions(requestObject);
    let resolvedUrl = '';

    return gatewayUrl$.pipe(
      tap((url: string) => { resolvedUrl = url }),
      switchMap(url => this.httpClient.post$(url, requestObject, httpOptions)),
      map((response: IHttpClientResponse<IJwtResponse>) => this.responseDecoder.decode(response)),
      tap((response: IDecodedResponse) => this.handleJwtUpdates(response)),
      map((response: IDecodedResponse) => ({ ...response.customerOutput, jwt: response.responseJwt } as T)),
      catchError((error: Error) => {
        if (error.message.startsWith('timeout')) {
          this.sentryService.sendCustomMessage(new RequestTimeoutError('Request timeout', { originalError: error, type: TimeoutDetailsType.GATEWAY, requestUrl: resolvedUrl }));
        }
        this.resetJwt();
        return throwError(error);
      }),
    );
  }

  private handleJwtUpdates(response: IDecodedResponse): void {
    if (Number(response.customerOutput.errorcode) !== 0) {
      return this.resetJwt();
    }

    if (response.updatedMerchantJwt) {
      this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_REPLACED, data: response.updatedMerchantJwt });
    }
  }

  private resetJwt(): void {
    this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_RESET });
  }
}
