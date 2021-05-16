import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { Observable, of, throwError } from 'rxjs';
import { ChallengeResultInterface, ResultActionCode } from '3ds-sdk-js';
import { PAYMENT_ERROR } from '../../../../models/constants/Translations';
import { Service } from 'typedi';

@Service()
export class ChallengeResultHandler {
  handle(response: IThreeDQueryResponse, result: ChallengeResultInterface): Observable<IThreeDQueryResponse> {
    switch (result.status) {
      case ResultActionCode.FAILURE:
      case ResultActionCode.ERROR:
        return throwError({
          ...response,
          acquirerresponsemessage: result.description,
          errorcode: '50003',
          errormessage: PAYMENT_ERROR,
          threedresponse: result.data,
        });
      default:
        return of({ ...response, threedresponse: result.data });
    }
  }
}
