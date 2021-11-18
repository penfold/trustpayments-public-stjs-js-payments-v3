import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRequestProcessor } from '../IRequestProcessor';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { RemainingRequestTypesProvider } from '../../three-d-verification/RemainingRequestTypesProvider';
import { RequestType } from '../../../../../shared/types/RequestType';

@Service()
export class TermUrlRequestProcessor implements IRequestProcessor {
  private static readonly TERM_URL = 'https://termurl';

  constructor(private remainingRequestTypesProvider: RemainingRequestTypesProvider) {
  }

  process(requestData: IStRequest, options: IRequestProcessingOptions): Observable<IStRequest> {
    return this.remainingRequestTypesProvider.getRemainingRequestTypes().pipe(
      map(requestTypes => {
        if (!requestTypes.includes(RequestType.THREEDQUERY)) {
          return requestData;
        }

        return {
          ...requestData,
          termurl: requestData.termurl || TermUrlRequestProcessor.TERM_URL,
        };
      }),
    );
  }
}
