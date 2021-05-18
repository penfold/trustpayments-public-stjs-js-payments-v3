import { Service } from 'typedi';
import { from, Observable, of, throwError } from 'rxjs';
import { IThreeDInitResponse } from '../models/IThreeDInitResponse';
import { map, switchMap, tap } from 'rxjs/operators';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { IThreeDLookupResponse } from '../models/IThreeDLookupResponse';
import { IStRequest } from '../models/IStRequest';
import { StTransport } from './st-transport/StTransport';
import { PUBLIC_EVENTS } from '../models/constants/EventTypes';
import { ThreeDInitRequest } from './three-d-verification/data/ThreeDInitRequest';
import { IMessageBus } from '../shared/message-bus/IMessageBus';
import { ThreeDLookupRequest } from './three-d-verification/implementations/trust-payments/data/ThreeDLookupRequest';
import { ICard } from '../models/ICard';

@Service()
export class GatewayClient {
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

  threedQuery(request: IStRequest): Observable<IThreeDQueryResponse> {
    return from(this.stTransport.sendRequest(request)).pipe(
      map((response: { response: IThreeDQueryResponse }) => response.response)
    );
  }

  threedLookup({ expirydate, pan, securitycode }: ICard): Observable<IThreeDLookupResponse> {
    return from(this.stTransport.sendRequest(new ThreeDLookupRequest(expirydate, pan, securitycode))).pipe(
      switchMap(({ response }: { response: IThreeDLookupResponse }) => {
        return Number(response.errorcode) === 0 ? of(response) : throwError(response);
      })
    );
  }
}
