import { Observable } from 'rxjs';
import { IStRequest } from '../../models/IStRequest';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';

export interface IErrorHandler {
  handle(
    error: unknown,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse> | Observable<never>;
}
