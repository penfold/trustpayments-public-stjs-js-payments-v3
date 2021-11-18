import { Observable, of, throwError } from 'rxjs';
import { ChallengeResultInterface, ResultActionCode, ThreeDSecureVersion } from '@trustpayments/3ds-sdk-js';
import { Service } from 'typedi';
import { PAYMENT_CANCELLED, PAYMENT_ERROR } from '../../../../models/constants/Translations';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { ThreeDResponseConverter } from './threedresponse-converter/ThreeDResponseConverter';

@Service()
export class ChallengeResultHandler {
  constructor(private threeDResponseConverter: ThreeDResponseConverter) {
  }

  handle$(response: IThreeDQueryResponse, result: ChallengeResultInterface): Observable<IThreeDQueryResponse> {
    switch (result.status) {
      case ResultActionCode.FAILURE:
      case ResultActionCode.ERROR:
        return throwError(this.appendChallengeResultToResponse({
          ...response,
          acquirerresponsemessage: result.description,
          errorcode: '50003',
          errormessage: PAYMENT_ERROR,
        }, result));
      case ResultActionCode.CANCELLED:
        return throwError({
          ...response,
          errorcode: '0',
          errormessage: PAYMENT_CANCELLED,
          isCancelled: true,
        });
      default:
        return of(this.appendChallengeResultToResponse(response, result));
    }
  }

  private appendChallengeResultToResponse(response: IThreeDQueryResponse, challengeResult: ChallengeResultInterface): IThreeDQueryResponse {
    const version = new ThreeDSecureVersion(response.threedversion);
    const { PaRes: pares, MD: md } = challengeResult.data;
    const threedresponse = this.threeDResponseConverter.convert(response, challengeResult);

    if (version.isHigherOrEqual(ThreeDSecureVersion.V2)) {
      return { ...response, threedresponse };
    }

    return { ...response, threedresponse, pares, md };
  }
}
