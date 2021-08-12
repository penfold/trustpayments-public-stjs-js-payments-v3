import { IRequestProcessor } from '../IRequestProcessor';
import { Service } from 'typedi';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { Observable } from 'rxjs';
import { BrowserDataProvider } from '../../three-d-verification/implementations/trust-payments/BrowserDataProvider';
import { map } from 'rxjs/operators';

@Service()
export class BrowserDataRequestProcessor implements IRequestProcessor {
  constructor(private browserDataProvider: BrowserDataProvider) {
  }

  process(requestData: IStRequest, options: IRequestProcessingOptions): Observable<IStRequest> {
    return this.browserDataProvider.getBrowserData$().pipe(
      map(browserData => ({ ...requestData, ...browserData })),
    );
  }
}
