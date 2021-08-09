import { IResponseProcessor } from '../IResponseProcessor';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { ThreeDSecureChallengeService } from '../../three-d-verification/implementations/trust-payments/ThreeDSecureChallengeService';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';
import { RequestType } from '../../../../../shared/types/RequestType';

@Service()
export class TPChallengeResponseProcessor implements IResponseProcessor {
  constructor(private challengeService: ThreeDSecureChallengeService) {
  }

  process(
    response: IRequestTypeResponse,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse> {
    if (!this.isThreeDQueryResponse(response)) {
      return of(response);
    }

    if (!response.acsurl) {
      return of(response);
    }

    return this.challengeService.doChallenge$(response, response.paymenttypedescription);
  }

  private isThreeDQueryResponse(response: IRequestTypeResponse): response is IThreeDQueryResponse {
    return response.requesttypedescription === RequestType.THREEDQUERY;
  }
}
