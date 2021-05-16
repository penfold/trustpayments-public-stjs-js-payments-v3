import { Service } from 'typedi';
import { from, Observable, of, throwError } from 'rxjs';
import { IThreeDInitResponse } from '../models/IThreeDInitResponse';
import { map, switchMap, tap } from 'rxjs/operators';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { IThreeDSchemaLookupResponse } from '../models/IThreeDSchemaLookupResponse';
import { IStRequest } from '../models/IStRequest';
import { StTransport } from './st-transport/StTransport';
import { PUBLIC_EVENTS } from '../models/constants/EventTypes';
import { ThreeDInitRequest } from './three-d-verification/data/ThreeDInitRequest';
import { IMessageBus } from '../shared/message-bus/IMessageBus';
import { ThreeDSchemaLookupRequest } from './three-d-verification/implementations/trust-payments/data/ThreeDLookupRequest';

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

  schemaLookup(pan: string): Observable<IThreeDSchemaLookupResponse> {
    return from(this.stTransport.sendRequest(new ThreeDSchemaLookupRequest(pan))).pipe(
      switchMap(({ response }: { response: IThreeDSchemaLookupResponse }) => {
        return Number(response.errorcode) === 0 ? of(response) : throwError(response);
      })
    );
  }
}
