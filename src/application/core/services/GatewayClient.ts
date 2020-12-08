import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { IThreeDInitResponse } from '../models/IThreeDInitResponse';
import { map, tap } from 'rxjs/operators';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { IStRequest } from '../models/IStRequest';
import { StTransport } from './st-transport/StTransport.class';
import { PUBLIC_EVENTS } from '../models/constants/EventTypes';
import { ThreeDInitRequest } from './three-d-verification/data/ThreeDInitRequest';
import { IMessageBus } from '../shared/message-bus/IMessageBus';

@Service()
export class GatewayClient {
  constructor(private stTransport: StTransport, private messageBus: IMessageBus) {}

  jsInit(): Observable<IThreeDInitResponse> {
    return from(this.stTransport.sendRequest(new ThreeDInitRequest())).pipe(
      map((result: { jwt: string; response: IThreeDInitResponse }) => result.response),
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
}
