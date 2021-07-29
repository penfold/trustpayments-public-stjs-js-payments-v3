import { Observable } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IStRequest } from '../../models/IStRequest';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';

export abstract class IGatewayClient {
  abstract jsInit(): Observable<IThreeDInitResponse>;
  abstract threedQuery(request: IStRequest, merchantUrl?: string): Observable<IThreeDQueryResponse>;
  abstract auth(request: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse>;
}
