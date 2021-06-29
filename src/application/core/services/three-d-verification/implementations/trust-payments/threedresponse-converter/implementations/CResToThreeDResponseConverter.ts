import { Service } from 'typedi';
import { ICResData } from '../../data/ICResData';
import { ChallengeResultInterface } from '@trustpayments/3ds-sdk-js';
import { AbstractThreeDResponseConverter } from './AbstractThreeDResponseConverter';
import { IThreeDResponseJwt } from '../../data/IThreeDResponseJwt';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';

@Service()
export class CResToThreeDResponseConverter extends AbstractThreeDResponseConverter {
  protected preparePayload(response:IThreeDQueryResponse, challengeResult: ChallengeResultInterface): IThreeDResponseJwt {
    const payload = super.preparePayload(response, challengeResult);
    const cResData: ICResData = JSON.parse(atob(challengeResult.data.cres));

    payload.Payload.Payment.ExtendedData.ThreeDSVersion = cResData.messageVersion;
    payload.Payload.Payment.ExtendedData.PAResStatus = cResData.transStatus;
    payload.Payload.CRes = challengeResult.data.cres;

    return payload;
  }
}
