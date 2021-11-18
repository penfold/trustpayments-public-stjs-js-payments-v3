import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IResponseProcessor } from '../IResponseProcessor';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../../models/IStRequest';
import { RequestType } from '../../../../../shared/types/RequestType';
import { CardinalChallengeService } from '../../three-d-verification/implementations/cardinal-commerce/CardinalChallengeService';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';

@Service()
export class CardinalChallengeResponseProcessor implements IResponseProcessor {
  constructor(private challengeService: CardinalChallengeService) {
  }

  process(
    response: IRequestTypeResponse,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse> {
    if (response.requesttypedescription !== RequestType.THREEDQUERY) {
      return of(response);
    }

    if (!this.challengeService.isChallengeRequired(response as IThreeDQueryResponse)) {
      return of(response);
    }

    return this.challengeService.runChallenge$(response as IThreeDQueryResponse, options.jsInitResponse);
  }
}
