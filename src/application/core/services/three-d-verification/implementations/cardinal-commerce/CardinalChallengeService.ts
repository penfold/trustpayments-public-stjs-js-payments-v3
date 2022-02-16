import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { IThreeDInitResponse } from '../../../../models/IThreeDInitResponse';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { GoogleAnalytics } from '../../../../integrations/google-analytics/GoogleAnalytics';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { Enrollment } from '../../../../models/constants/Enrollment';
import { IMessageBus } from '../../../../shared/message-bus/IMessageBus';
import { EventScope } from '../../../../models/constants/EventScope';
import { VerificationResultHandler } from './VerificationResultHandler';
import { IVerificationResult } from './data/IVerificationResult';
import { IVerificationData } from './data/IVerificationData';

@Service()
export class CardinalChallengeService {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private verificationResultHandler: VerificationResultHandler,
    private googleAnalytics: GoogleAnalytics,
    private messageBus: IMessageBus,
  ) {
  }

  isChallengeRequired(threeDQueryResponse: IThreeDQueryResponse): boolean {
    return threeDQueryResponse.enrolled === Enrollment.AUTHENTICATION_SUCCESSFUL && threeDQueryResponse.acsurl !== undefined;
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

    this.messageBus.publish({
      type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW,
    },  EventScope.ALL_FRAMES)

    return from(this.interFrameCommunicator.query<IVerificationResult>(verifyQueryEvent, MERCHANT_PARENT_FRAME)).pipe(
      tap(() => this.googleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      tap(() => this.messageBus.publish({
        type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
      },  EventScope.ALL_FRAMES)),
      switchMap((validationResult: IVerificationResult) => this.verificationResultHandler.handle$(threeDQueryResponse, validationResult, jsInitResponse)),
    );
  }
}
