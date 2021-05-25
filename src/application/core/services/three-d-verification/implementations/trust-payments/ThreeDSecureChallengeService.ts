import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { from, Observable } from 'rxjs';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IChallengeData } from '../../../../../../client/integrations/three-d-secure/IChallengeData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { switchMap } from 'rxjs/operators';
import { ChallengeResultInterface, ThreeDSecureVersion } from '3ds-sdk-js';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ChallengeResultHandler } from './ChallengeResultHandler';
import { Service } from 'typedi';

@Service()
export class ThreeDSecureChallengeService {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private challengeResultHandler: ChallengeResultHandler,
  ) {
  }

  doChallenge$(threeDQueryResponse: IThreeDQueryResponse): Observable<IThreeDQueryResponse> {
    const queryEvent: IMessageBusEvent<IChallengeData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE,
      data: {
        version: threeDQueryResponse.threedversion as ThreeDSecureVersion,
        payload: threeDQueryResponse.threedpayload,
        challengeURL: threeDQueryResponse.acsurl,
      },
    };

    return from(this.interFrameCommunicator.query<ChallengeResultInterface>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
      switchMap((challengeResult: ChallengeResultInterface) => {
        return this.challengeResultHandler.handle$(threeDQueryResponse, challengeResult);
      }),
    );
  }
}
