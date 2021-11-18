import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRequestProcessor } from '../IRequestProcessor';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { BrowserDataProvider } from '../../three-d-verification/implementations/trust-payments/BrowserDataProvider';

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
