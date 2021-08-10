import { Service } from 'typedi';
import { from, Observable, of, throwError } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { map, switchMap, tap } from 'rxjs/operators';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { IStRequest } from '../../models/IStRequest';
import { StTransport } from '../st-transport/StTransport';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { ThreeDInitRequest } from '../three-d-verification/data/ThreeDInitRequest';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IGatewayClient } from './IGatewayClient';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IThreeDLookupResponse } from '../../models/IThreeDLookupResponse';
import { ThreeDLookupRequest } from '../three-d-verification/implementations/trust-payments/data/ThreeDLookupRequest';

@Service()
export class StTransportGatewayClient implements IGatewayClient {
  constructor(private stTransport: StTransport, private messageBus: IMessageBus) {}

  jsInit(): Observable<IThreeDInitResponse> {
    return from(this.stTransport.sendRequest(new ThreeDInitRequest())).pipe(
      switchMap(({ response }: { response: IThreeDInitResponse }) => {
        return Number(response.errorcode) === 0 ? of(response) : throwError(response);
      }),
      tap((response: IThreeDInitResponse) => {
        this.messageBus.publish({ type: PUBLIC_EVENTS.JSINIT_RESPONSE, data: response });
      })
    );
  }

  threedLookup(request: ThreeDLookupRequest): Observable<IThreeDLookupResponse> {
    return from(this.stTransport.sendRequest(request)).pipe(
      switchMap(({ response }: { response: IThreeDLookupResponse }) => {
        return Number(response.errorcode) === 0 ? of(response) : throwError(response);
      })
    );
  }

  threedQuery(request: IStRequest, merchantUrl?: string): Observable<IThreeDQueryResponse> {
    return from(this.stTransport.sendRequest(request, merchantUrl)).pipe(
      map((response: { response: IThreeDQueryResponse }) => response.response)
    );
  }

  auth(request: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse> {
    return from(this.stTransport.sendRequest(request, merchantUrl)).pipe(
      map((response: { response: IRequestTypeResponse }) => response.response)
    );
  }
}
