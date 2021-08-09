import { IStRequest } from '../../models/IStRequest';
import { Observable } from 'rxjs';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';

export interface IRequestProcessingService {
  init(jsInitResponse: IThreeDInitResponse | null): Observable<void>;
  process(requestData: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse>;
}
