import { Service } from 'typedi';
import { AbstractThreeDResponseConverter } from './AbstractThreeDResponseConverter';
import { IThreeDResponseJwt } from '../../data/IThreeDResponseJwt';
import { ChallengeResultInterface } from '@trustpayments/3ds-sdk-js';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';

@Service()
export class PaResToThreeDResponseConverter extends AbstractThreeDResponseConverter {
  protected preparePayload(response: IThreeDQueryResponse, challengeResult: ChallengeResultInterface): IThreeDResponseJwt {
    const payload = super.preparePayload(response, challengeResult);

    payload.Payload.Payment.ExtendedData.ThreeDSVersion = response.threedversion;
    payload.Payload.MD = challengeResult.data.MD;
    payload.Payload.PaRes = challengeResult.data.PaRes;

    return payload;
  }
}
