import { Observable } from 'rxjs';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../models/IStRequest';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';

export interface IResponseProcessor {
  process(
    response: IRequestTypeResponse,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse>;
}
