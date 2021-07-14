import { Observable } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IStRequest } from '../../models/IStRequest';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';

export abstract class IGatewayClient {
  abstract jsInit(): Observable<IThreeDInitResponse>;
  abstract threedQuery(request: IStRequest): Observable<IThreeDQueryResponse>;
}
