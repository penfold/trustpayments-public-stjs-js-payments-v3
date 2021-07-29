import { Service } from 'typedi';
import { Observable, of, throwError } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { switchMap, tap } from 'rxjs/operators';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { IStRequest } from '../../models/IStRequest';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { ThreeDInitRequest } from '../three-d-verification/data/ThreeDInitRequest';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IGatewayClient } from './IGatewayClient';
import { TransportService } from '../st-transport/TransportService';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';

@Service()
export class TransportServiceGatewayClient implements IGatewayClient {
  constructor(private transportService: TransportService, private messageBus: IMessageBus) {}

  jsInit(): Observable<IThreeDInitResponse> {
    return this.transportService.sendRequest(new ThreeDInitRequest()).pipe(
      switchMap((response: IThreeDInitResponse) => {
        return Number(response.errorcode) === 0 ? of(response) : throwError(response);
      }),
      tap((response: IThreeDInitResponse) => {
        this.messageBus.publish({ type: PUBLIC_EVENTS.JSINIT_RESPONSE, data: response });
      }),
    );
  }

  threedQuery(request: IStRequest, merchantUrl?: string): Observable<IThreeDQueryResponse> {
    return this.transportService.sendRequest(request, merchantUrl);
  }

  auth(request: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse> {
    return this.transportService.sendRequest(request, merchantUrl);
  }
}
