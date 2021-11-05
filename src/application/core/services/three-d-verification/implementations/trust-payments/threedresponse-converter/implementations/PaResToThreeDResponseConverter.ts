import { Service } from 'typedi';
import { ChallengeResultInterface } from '@trustpayments/3ds-sdk-js';
import { IThreeDResponseJwt } from '../../data/IThreeDResponseJwt';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';
import { AbstractThreeDResponseConverter } from './AbstractThreeDResponseConverter';

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
