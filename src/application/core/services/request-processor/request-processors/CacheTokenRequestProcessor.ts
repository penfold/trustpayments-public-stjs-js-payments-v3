import { IRequestProcessor } from '../IRequestProcessor';
import { Service } from 'typedi';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { Observable, of } from 'rxjs';

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
