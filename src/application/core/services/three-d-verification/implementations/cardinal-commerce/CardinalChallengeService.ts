import { Service } from 'typedi';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { from, Observable } from 'rxjs';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IVerificationData } from './data/IVerificationData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { IVerificationResult } from './data/IVerificationResult';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { switchMap, tap } from 'rxjs/operators';
import { GoogleAnalytics } from '../../../../integrations/google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { VerificationResultHandler } from './VerificationResultHandler';
import { Enrolled } from '../../../../models/constants/Enrolled';

@Service()
export class CardinalChallengeService {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private verificationResultHandler: VerificationResultHandler,
  ) {
  }

  isChallengeRequired(threeDQueryResponse: IThreeDQueryResponse): boolean {
    return threeDQueryResponse.enrolled === Enrolled.Y && threeDQueryResponse.acsurl !== undefined;
  }

  runChallenge$(threeDQueryResponse: IThreeDQueryResponse, jsInitResponse: IThreeDInitResponse): Observable<IThreeDQueryResponse> {
    const verifyQueryEvent: IMessageBusEvent<IVerificationData> = {
      type: PUBLIC_EVENTS.CARDINAL_CONTINUE,
      data: {
        transactionId: threeDQueryResponse.acquirertransactionreference,
        jwt: jsInitResponse.threedinit,
        acsUrl: threeDQueryResponse.acsurl,
        payload: threeDQueryResponse.threedpayload,
      },
    };

    return from(this.interFrameCommunicator.query<IVerificationResult>(verifyQueryEvent, MERCHANT_PARENT_FRAME)).pipe(
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap((validationResult: IVerificationResult) => this.verificationResultHandler.handle$(threeDQueryResponse, validationResult, jsInitResponse)),
    );
  }
}
