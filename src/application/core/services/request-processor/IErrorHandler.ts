import { IStRequest } from '../../models/IStRequest';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';
import { Observable } from 'rxjs';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';

export interface IErrorHandler {
  handle(
    error: unknown,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse> | Observable<never>;
}
