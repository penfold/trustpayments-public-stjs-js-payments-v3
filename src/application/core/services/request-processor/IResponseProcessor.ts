import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../models/IStRequest';
import { Observable } from 'rxjs';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';

export interface IResponseProcessor {
  process(
    response: IRequestTypeResponse,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse>;
}
