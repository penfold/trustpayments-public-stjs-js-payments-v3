import { Observable } from 'rxjs';
import { IStRequest } from '../../models/IStRequest';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';

export interface IRequestProcessor {
  process(
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IStRequest>;
}
