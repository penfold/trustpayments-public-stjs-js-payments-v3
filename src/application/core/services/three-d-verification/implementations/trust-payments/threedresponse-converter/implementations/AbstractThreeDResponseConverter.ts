import { IThreeDResponseConverter } from '../IThreeDResponseConverter';
import { UnsignedJwtGenerator } from '../unsigned-jwt-generator/UnsignedJwtGenerator';
import { ChallengeResultInterface, ResultActionCode } from '@trustpayments/3ds-sdk-js';
import { Uuid } from '../../../../../../shared/uuid/Uuid';
import { IThreeDResponseJwt } from '../../data/IThreeDResponseJwt';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';

export abstract class AbstractThreeDResponseConverter implements IThreeDResponseConverter {
  private static readonly ERROR_NUMBER_SUCCESS = 0;
  private static readonly ERROR_NUMBER_FAILURE = 1000;
  private static JWT_EXPIRATION = 2 * 60 * 60; // 2 hours

  protected constructor(protected unsignedJwtGenerator: UnsignedJwtGenerator) {
  }

  convert(response: IThreeDQueryResponse, result: ChallengeResultInterface): string {
    return this.unsignedJwtGenerator.generate(this.preparePayload(response, result));
  }

  protected preparePayload(response: IThreeDQueryResponse, result: ChallengeResultInterface): IThreeDResponseJwt {
    const iat = Math.round(new Date().getTime() / 1000);
    const verificationSucceeded = result.status === ResultActionCode.SUCCESS || result.status === ResultActionCode.COMPLETED;

    return {
      iss: '',
      iat,
      exp: iat + AbstractThreeDResponseConverter.JWT_EXPIRATION,
      jti: Uuid.uuidv4(),
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
        ActionCode: result.status,
        ErrorNumber: verificationSucceeded
          ? AbstractThreeDResponseConverter.ERROR_NUMBER_SUCCESS
          : AbstractThreeDResponseConverter.ERROR_NUMBER_FAILURE,
        ErrorDescription: result.description,
      },
    };
  }
}
