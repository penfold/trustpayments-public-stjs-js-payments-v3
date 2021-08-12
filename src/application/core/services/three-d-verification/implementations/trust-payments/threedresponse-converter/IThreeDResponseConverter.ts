import { ChallengeResultInterface } from '@trustpayments/3ds-sdk-js';
import { IThreeDQueryResponse } from '../../../../../models/IThreeDQueryResponse';

export interface IThreeDResponseConverter {
  convert(response: IThreeDQueryResponse, challengeResult: ChallengeResultInterface): string;
}
