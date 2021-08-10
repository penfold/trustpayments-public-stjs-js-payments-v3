import { Service } from 'typedi';
import { IResponseProcessor } from '../IResponseProcessor';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../../models/IStRequest';
import { Observable, of } from 'rxjs';
import { RemainingRequestTypesProvider } from '../../three-d-verification/RemainingRequestTypesProvider';
import { switchMap } from 'rxjs/operators';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { TransportService } from '../../st-transport/TransportService';
import { RequestType } from '../../../../../shared/types/RequestType';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';

@Service()
export class RemainingRequestTypesResponseProcessor implements IResponseProcessor {
  constructor(
    private remainingRequestTypesProvider: RemainingRequestTypesProvider,
    private transportService: TransportService,
  ) {}

  process(
    response: IRequestTypeResponse,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse> {
    if (Number(response.errorcode) !== 0) {
      return of(response);
    }

    return this.remainingRequestTypesProvider.getRemainingRequestTypes().pipe(
      switchMap(requestTypes => {
        if (requestTypes.length === 0) {
          return of(response);
        }
        if (this.isThreeDQueryResponse(response)) {
          requestData = {
            ...requestData,
            md: response.md,
            pares: response.pares,
            threedresponse: response.threedresponse,
          };
        }

        return this.transportService.sendRequest(requestData, options.merchantUrl);
      }),
    );
  }

  private isThreeDQueryResponse(response: IRequestTypeResponse): response is IThreeDQueryResponse {
    return response.requesttypedescription === RequestType.THREEDQUERY;
  }
}
