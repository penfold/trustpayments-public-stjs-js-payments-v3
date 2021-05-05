import { Service } from 'typedi';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IVerificationResult } from './data/IVerificationResult';
import { Observable, of, throwError } from 'rxjs';
import { PAYMENT_ERROR } from '../../models/constants/Translations';
import { ActionCode } from './data/ActionCode';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';

@Service()
export class VerificationResultHandler {
  handle(
    response: IThreeDQueryResponse,
    result: IVerificationResult,
    jsInitResponse: IThreeDInitResponse,
  ): Observable<IThreeDQueryResponse> {
    switch (result.actionCode) {
      case ActionCode.SUCCESS:
      case ActionCode.NOACTION:
        return of({
          ...response,
          threedresponse: result.jwt,
          cachetoken: jsInitResponse.cachetoken,
        });
      case ActionCode.ERROR:
      case ActionCode.FAILURE: {
        const errorResponse: IThreeDQueryResponse = {
          ...response,
          acquirerresponsecode: String(result.errorNumber),
          acquirerresponsemessage: result.errorDescription,
          errorcode: '50003',
          errormessage: PAYMENT_ERROR,
          threedresponse: result.jwt,
          cachetoken: jsInitResponse.cachetoken,
        };

        return throwError(errorResponse);
      }
    }
  }
}
