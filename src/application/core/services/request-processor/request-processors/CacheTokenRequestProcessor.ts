import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { IRequestProcessor } from '../IRequestProcessor';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';

@Service()
export class CacheTokenRequestProcessor implements IRequestProcessor {
  process(requestData: IStRequest, options: IRequestProcessingOptions): Observable<IStRequest> {
    if (!options.jsInitResponse) {
      return of(requestData);
    }

    return of({
      ...requestData,
      cachetoken: options.jsInitResponse.cachetoken,
    });
  }
}
