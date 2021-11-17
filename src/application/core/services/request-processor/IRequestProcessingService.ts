import { Observable } from 'rxjs';
import { IStRequest } from '../../models/IStRequest';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';

export interface IRequestProcessingService {
  init(jsInitResponse: IThreeDInitResponse | null): Observable<void>;
  process(requestData: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse>;
}
