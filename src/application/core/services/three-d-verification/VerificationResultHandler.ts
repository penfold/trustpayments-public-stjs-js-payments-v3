import { Service } from 'typedi';
import { IVerificationResult } from './data/IVerificationResult';
import { Observable, of, throwError } from 'rxjs';
import { PAYMENT_ERROR } from '../../models/constants/Translations';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { ActionCode } from './data/ActionCode';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';

@Service()
export class VerificationResultHandler {
  handle(
    response: IThreeDQueryResponse,
    result: IVerificationResult,
    tokens: IThreeDSTokens
  ): Observable<IThreeDQueryResponse> {
    switch (result.actionCode) {
      case ActionCode.SUCCESS:
      case ActionCode.NOACTION:
        return of({
          ...response,
          threedresponse: result.jwt,
          cachetoken: tokens.cacheToken
        });
      case ActionCode.ERROR:
      case ActionCode.FAILURE:
        const errorResponse: IThreeDQueryResponse = {
          ...response,
          acquirerresponsecode: String(result.errorNumber),
          acquirerresponsemessage: result.errorDescription,
          errorcode: '50003',
          errormessage: PAYMENT_ERROR,
          threedresponse: result.jwt,
          cachetoken: tokens.cacheToken
        };

        return throwError(errorResponse);
    }
  }
}
