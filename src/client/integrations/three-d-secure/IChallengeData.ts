import { ThreeDSecureVersion, CardType } from '@trustpayments/3ds-sdk-js';

export interface IChallengeData {
  version: ThreeDSecureVersion,
  payload: string,
  challengeURL: string,
  cardType: CardType,
}
