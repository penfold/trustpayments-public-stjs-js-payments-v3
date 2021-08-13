import { IThreeDQueryResponse } from '../../../../models/IThreeDQueryResponse';
import { from, Observable } from 'rxjs';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IChallengeData } from '../../../../../../client/integrations/three-d-secure/IChallengeData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { switchMap } from 'rxjs/operators';
import { ChallengeResultInterface, ThreeDSecureVersion, CardType } from '@trustpayments/3ds-sdk-js';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ChallengeResultHandler } from './ChallengeResultHandler';
import { Service } from 'typedi';
import { environment } from '../../../../../../environments/environment';

@Service()
export class ThreeDSecureChallengeService {
  private static readonly TERM_URL = environment.THREEDS_TERM_URL;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private challengeResultHandler: ChallengeResultHandler,
  ) {
  }

  doChallenge$(threeDQueryResponse: IThreeDQueryResponse, cardType: CardType): Observable<IThreeDQueryResponse> {
    const queryEvent = this.createQueryEvent(threeDQueryResponse, cardType);

    return from(this.interFrameCommunicator.query<ChallengeResultInterface>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
      switchMap((challengeResult: ChallengeResultInterface) => {
        return this.challengeResultHandler.handle$(threeDQueryResponse, challengeResult);
      }),
    );
  }

  private createQueryEvent(threeDQueryResponse: IThreeDQueryResponse, cardType: CardType): IMessageBusEvent<IChallengeData> {
    const threeDVersion = new ThreeDSecureVersion(threeDQueryResponse.threedversion);

    if (threeDVersion.isLowerThan(ThreeDSecureVersion.V2)) {
      return {
        type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE,
        data: {
          version: threeDVersion.toString(),
          payload: threeDQueryResponse.pareq,
          challengeURL: threeDQueryResponse.acsurl,
          termURL: ThreeDSecureChallengeService.TERM_URL,
          merchantData: threeDQueryResponse.md,
          cardType,
        },
      };
    }

    return {
      type: PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE,
      data: {
        version: threeDVersion.toString(),
        payload: threeDQueryResponse.threedpayload,
        challengeURL: threeDQueryResponse.acsurl,
        cardType: cardType as CardType,
      },
    };
  }
}
