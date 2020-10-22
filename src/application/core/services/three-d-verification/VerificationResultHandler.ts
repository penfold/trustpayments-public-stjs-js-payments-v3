import { Service } from 'typedi';
import { IVerificationResult } from './data/IVerificationResult';
import { Observable, of, throwError } from 'rxjs';
import { IAuthorizePaymentResponse } from '../../models/IAuthorizePaymentResponse';
import { ActionCode } from '../../../../shared/integrations/cardinal-commerce/ActionCode';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { StCodec } from '../st-codec/StCodec.class';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { StTransport } from '../st-transport/StTransport.class';
import { IThreeDSTokens } from './data/IThreeDSTokens';

@Service()
export class VerificationResultHandler {
  constructor(private notification: NotificationService, private transport: StTransport) {}

  handle(result: IVerificationResult, tokens: IThreeDSTokens): Observable<IAuthorizePaymentResponse> {
    switch (result.actionCode) {
      case ActionCode.SUCCESS:
      case ActionCode.NOACTION:
        return of({
          cachetoken: tokens.cacheToken,
          threedresponse: result.jwt
        });
      case ActionCode.ERROR:
        this.notification.error(COMMUNICATION_ERROR_INVALID_RESPONSE);
        return throwError(result);
      case ActionCode.FAILURE:
        StCodec.publishResponse(
          this.transport._threeDQueryResult.response,
          this.transport._threeDQueryResult.jwt,
          result.jwt
        );
        return throwError(result);
    }
  }
}
