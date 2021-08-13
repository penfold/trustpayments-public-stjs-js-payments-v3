import { CardType } from '@trustpayments/3ds-sdk-js';

export interface IChallengeData {
  version: string,
  payload: string,
  challengeURL: string,
  cardType: CardType,
  termURL?: string,
  merchantData?: string,
}
