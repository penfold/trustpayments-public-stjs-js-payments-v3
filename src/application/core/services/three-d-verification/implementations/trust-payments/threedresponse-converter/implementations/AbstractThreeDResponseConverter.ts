import { IThreeDResponseConverter } from '../IThreeDResponseConverter';
import { UnsignedJwtGenerator } from '../unsigned-jwt-generator/UnsignedJwtGenerator';
import { ChallengeResultInterface, ResultActionCode } from '@trustpayments/3ds-sdk-js';
import { Uuid } from '../../../../../../shared/uuid/Uuid';
import { IThreeDResponseJwt } from '../../data/IThreeDResponseJwt';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';
import { Service } from 'typedi';

@Service()
export abstract class AbstractThreeDResponseConverter implements IThreeDResponseConverter {
  private static readonly ERROR_NUMBER_SUCCESS = 0;
  private static readonly ERROR_NUMBER_FAILURE = 1000;
  private static JWT_EXPIRATION = 7200; // 2 hours

  constructor(protected unsignedJwtGenerator: UnsignedJwtGenerator, private uuid: Uuid) {
  }

  convert(response: IThreeDQueryResponse, challengeResult: ChallengeResultInterface): string {
    return this.unsignedJwtGenerator.generate(this.preparePayload(response, challengeResult));
  }

  protected preparePayload(response: IThreeDQueryResponse, challengeResult: ChallengeResultInterface): IThreeDResponseJwt {
    const iat = Math.round(new Date().getTime() / 1000);
    const verificationSucceeded = challengeResult.status === ResultActionCode.SUCCESS || challengeResult.status === ResultActionCode.COMPLETED;

    return {
      iss: '',
      iat,
      exp: iat + AbstractThreeDResponseConverter.JWT_EXPIRATION,
      jti: this.uuid.uuidv4(),
      ConsumerSessionId: '',
      ReferenceId: '',
      aud: '',
      Payload: {
        Validated: verificationSucceeded,
        Payment: {
          Type: 'CCA',
          ProcessorTransactionId: '',
          ExtendedData: {
            Amount: '',
            CAVV: '',
            CurrencyCode: '',
            ECIFlag: '',
            ThreeDSVersion: '',
            PAResStatus: '',
            SignatureVerification: 'Y',
          },
        },
        ActionCode: challengeResult.status,
        ErrorNumber: verificationSucceeded
          ? AbstractThreeDResponseConverter.ERROR_NUMBER_SUCCESS
          : AbstractThreeDResponseConverter.ERROR_NUMBER_FAILURE,
        ErrorDescription: challengeResult.description,
      },
    };
  }
}
