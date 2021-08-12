import { IStRequest } from '../../models/IStRequest';
import { Observable } from 'rxjs';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';

export interface IRequestProcessor {
  process(
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IStRequest>;
}
