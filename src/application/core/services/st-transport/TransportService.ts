import { RequestEncoderService } from '../st-codec/RequestEncoderService';
import { ResponseDecoderService } from '../st-codec/ResponseDecoderService';
import { IStRequest } from '../../models/IStRequest';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, IHttpClientResponse } from '@trustpayments/http-client';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IJwtResponse } from '../st-codec/interfaces/IJwtResponse';
import { IHttpOptionsProvider } from './http-options-provider/IHttpOptionsProvider';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { IRequestObject } from '../../models/IRequestObject';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IDecodedResponse } from '../st-codec/interfaces/IDecodedResponse';

@Service()
export class TransportService {
  constructor(
    private requestEncoder: RequestEncoderService,
    private responseDecoder: ResponseDecoderService,
    private httpClient: HttpClient,
    private configProvider: ConfigProvider,
    private httpOptionsProvider: IHttpOptionsProvider,
    private messageBus: IMessageBus
  ) {}

  sendRequest(request: IStRequest, gatewayUrl?: string): Observable<IRequestTypeResponse & IJwtResponse> {
    const gatewayUrl$: Observable<string> = gatewayUrl
      ? of(gatewayUrl)
      : this.configProvider.getConfig$().pipe(map(config => config.datacenterurl));
    const requestObject: IRequestObject = this.requestEncoder.encode(request);
    console.log(this.httpOptionsProvider);
    const httpOptions: IHttpClientConfig = this.httpOptionsProvider.getOptions(requestObject);

    return gatewayUrl$.pipe(
      switchMap(url => this.httpClient.post$(url, requestObject, httpOptions)),
      map((response: IHttpClientResponse<IJwtResponse>) => this.responseDecoder.decode(response)),
      tap((response: IDecodedResponse) => this.handleJwtUpdates(response)),
      map((response: IDecodedResponse) => ({ ...response.customerOutput, jwt: response.responseJwt })),
      catchError((error: Error) => {
        this.resetJwt();
        return throwError(error);
      })
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
