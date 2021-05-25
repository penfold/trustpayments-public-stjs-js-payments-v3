import { ThreeDSecureVersion } from '3ds-sdk-js';

export interface IChallengeData {
  version: ThreeDSecureVersion,
  payload: string,
  challengeURL: string,
}
