import { IThreeDResponseConverter } from './IThreeDResponseConverter';
import { IThreeDQueryResponse } from '../../../../../models/IThreeDQueryResponse';
import { ChallengeResultInterface, ThreeDSecureVersion } from '@trustpayments/3ds-sdk-js';
import { Service } from 'typedi';
import { CResToThreeDResponseConverter } from './implementations/CResToThreeDResponseConverter';
import { PaResToThreeDResponseConverter } from './implementations/PaResToThreeDResponseConverter';

@Service()
export class ThreeDResponseConverter implements IThreeDResponseConverter {
  constructor(
    private cResToThreeDResponseConverter: CResToThreeDResponseConverter,
    private paResToThreeDResponseConverter: PaResToThreeDResponseConverter,
  ) {
  }

  convert(response: IThreeDQueryResponse, result: ChallengeResultInterface): string {
    if (new ThreeDSecureVersion(response.threedversion).isLowerThan(ThreeDSecureVersion.V2)) {
      return this.paResToThreeDResponseConverter.convert(response, result);
    }

    return this.cResToThreeDResponseConverter.convert(response, result);
  }
}
