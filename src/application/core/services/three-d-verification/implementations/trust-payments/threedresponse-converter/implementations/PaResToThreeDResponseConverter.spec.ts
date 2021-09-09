import { UnsignedJwtGenerator } from '../unsigned-jwt-generator/UnsignedJwtGenerator';
import { anyNumber, anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';
import { ChallengeResultInterface, ResultActionCode } from '@trustpayments/3ds-sdk-js';
import { PaResToThreeDResponseConverter } from './PaResToThreeDResponseConverter';
import { Uuid } from '../../../../../../shared/uuid/Uuid';

describe('PaResToThreeDResponseConverter', () => {
  let unsignedJwtGeneratorMock: UnsignedJwtGenerator;
  let uuidMock: Uuid;
  let sut: PaResToThreeDResponseConverter;

  beforeEach(() => {
    unsignedJwtGeneratorMock = mock(UnsignedJwtGenerator);
    uuidMock = mock(Uuid);
    sut = new PaResToThreeDResponseConverter(instance(unsignedJwtGeneratorMock), instance(uuidMock));

    when(unsignedJwtGeneratorMock.generate(anything())).thenReturn('jwt');
  });

  describe('convert', () => {
    const response: IThreeDQueryResponse = { threedversion: '1.0.5' } as IThreeDQueryResponse;
    const md = 'md_data';
    const pares = 'pares_data';

    it('creates a jwt payload for successful verification', () => {
      const challengeResult: ChallengeResultInterface = {
        status: ResultActionCode.COMPLETED,
        description: 'verification completed',
        data: {
          MD: md,
          PaRes: pares,
        },
      };

      expect(sut.convert(response, challengeResult)).toEqual('jwt');

      verify(unsignedJwtGeneratorMock.generate(deepEqual({
        iss: '',
        iat: anyNumber(),
        exp: anyNumber(),
        jti: anyString(),
        ConsumerSessionId: '',
        ReferenceId: '',
        aud: '',
        Payload: {
          Validated: true,
          Payment: {
            Type: 'CCA',
            ProcessorTransactionId: '',
            ExtendedData: {
              Amount: '',
              CAVV: '',
              CurrencyCode: '',
              ECIFlag: '',
              ThreeDSVersion: '1.0.5',
              PAResStatus: '',
              SignatureVerification: 'Y',
            },
          },
          ActionCode: 'COMPLETED',
          ErrorNumber: 0,
          ErrorDescription: 'verification completed',
          MD: md,
          PaRes: pares,
        },
      }))).once();
    });

    it('creates a jwt payload for failed verification', () => {
      const challengeResult: ChallengeResultInterface = {
        status: ResultActionCode.FAILURE,
        description: 'verification failed',
        transactionId: '12345',
        data: {
          MD: md,
          PaRes: pares,
        },
      };

      expect(sut.convert(response, challengeResult)).toEqual('jwt');

      verify(unsignedJwtGeneratorMock.generate(deepEqual({
        iss: '',
        iat: anyNumber(),
        exp: anyNumber(),
        jti: anyString(),
        ConsumerSessionId: '',
        ReferenceId: '',
        aud: '',
        Payload: {
          Validated: false,
          Payment: {
            Type: 'CCA',
            ProcessorTransactionId: '',
            ExtendedData: {
              Amount: '',
              CAVV: '',
              CurrencyCode: '',
              ECIFlag: '',
              ThreeDSVersion: '1.0.5',
              PAResStatus: '',
              SignatureVerification: 'Y',
            },
          },
          ActionCode: 'FAILURE',
          ErrorNumber: 1000,
          ErrorDescription: 'verification failed',
          MD: md,
          PaRes: pares,
        },
      }))).once();
    });
  });
});
