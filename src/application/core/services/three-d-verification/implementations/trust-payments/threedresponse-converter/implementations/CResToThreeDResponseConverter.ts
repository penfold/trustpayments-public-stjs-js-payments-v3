import { Service } from 'typedi';
import { ChallengeResultInterface } from '@trustpayments/3ds-sdk-js';
import { ICResData } from '../../data/ICResData';
import { IThreeDResponseJwt } from '../../data/IThreeDResponseJwt';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';
import { AbstractThreeDResponseConverter } from './AbstractThreeDResponseConverter';

@Service()
export class CResToThreeDResponseConverter extends AbstractThreeDResponseConverter {
  protected preparePayload(response:IThreeDQueryResponse, challengeResult: ChallengeResultInterface): IThreeDResponseJwt {
    const payload = super.preparePayload(response, challengeResult);
    const cResData = this.decodeCResData(challengeResult.data.cres);

    payload.Payload.Payment.ExtendedData.ThreeDSVersion = cResData.messageVersion;
    payload.Payload.Payment.ExtendedData.PAResStatus = cResData.transStatus;
    payload.Payload.CRes = challengeResult.data.cres;

    return payload;
  }

  private decodeCResData(cres: string): ICResData {
    try {
      return JSON.parse(atob(cres));
    } catch (e) {
      return {} as ICResData;
    }
  }
}
