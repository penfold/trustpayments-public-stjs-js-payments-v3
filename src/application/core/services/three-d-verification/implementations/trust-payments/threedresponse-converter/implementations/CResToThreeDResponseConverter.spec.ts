import { UnsignedJwtGenerator } from '../unsigned-jwt-generator/UnsignedJwtGenerator';
import { CResToThreeDResponseConverter } from './CResToThreeDResponseConverter';
import { anyNumber, anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { IThreeDQueryResponse } from '../../../../../../models/IThreeDQueryResponse';
import { ChallengeResultInterface, ResultActionCode } from '@trustpayments/3ds-sdk-js';
import { ICResData } from '../../data/ICResData';
import { Uuid } from '../../../../../../shared/uuid/Uuid';

describe('CResToThreeDResponseConverter', () => {
  let unsignedJwtGeneratorMock: UnsignedJwtGenerator;
  let uuidMock: Uuid;
  let sut: CResToThreeDResponseConverter;

  beforeEach(() => {
    unsignedJwtGeneratorMock = mock(UnsignedJwtGenerator);
    uuidMock = mock(Uuid);
    sut = new CResToThreeDResponseConverter(instance(unsignedJwtGeneratorMock), instance(uuidMock));

    when(unsignedJwtGeneratorMock.generate(anything())).thenReturn('jwt');
  });

  describe('convert', () => {
    const response: IThreeDQueryResponse = {} as IThreeDQueryResponse;

    const cresData: ICResData = {
      messageVersion: '2.1.0',
      transStatus: 'Y',
      acsTransID: '',
      challengeCompletionInd: 'Y',
      messageType: '',
      threeDSServerTransID: '',
    };

    const cres = btoa(JSON.stringify(cresData));

    it('creates a jwt payload for successful verification', () => {
      const challengeResult: ChallengeResultInterface = {
        status: ResultActionCode.SUCCESS,
        description: 'verification success',
        transactionId: '12345',
        data: {
          cres,
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
              ThreeDSVersion: '2.1.0',
              PAResStatus: 'Y',
              SignatureVerification: 'Y',
            },
          },
          ActionCode: 'SUCCESS',
          ErrorNumber: 0,
          ErrorDescription: 'verification success',
          CRes: cres,
        },
      }))).once();
    });

    it('creates a jwt payload for failed verification', () => {
      const challengeResult: ChallengeResultInterface = {
        status: ResultActionCode.FAILURE,
        description: 'verification failed',
        transactionId: '12345',
        data: {
          cres,
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
              ThreeDSVersion: '2.1.0',
              PAResStatus: 'Y',
              SignatureVerification: 'Y',
            },
          },
          ActionCode: 'FAILURE',
          ErrorNumber: 1000,
          ErrorDescription: 'verification failed',
          CRes: cres,
        },
      }))).once();
    });

    it('creates a jwt payload for failed verification with invalid cres data', () => {
      const cres = 'invalid';
      const challengeResult: ChallengeResultInterface = {
        status: ResultActionCode.FAILURE,
        description: 'verification failed',
        transactionId: '12345',
        data: {
          cres,
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
              ThreeDSVersion: undefined,
              PAResStatus: undefined,
              SignatureVerification: 'Y',
            },
          },
          ActionCode: 'FAILURE',
          ErrorNumber: 1000,
          ErrorDescription: 'verification failed',
          CRes: cres,
        },
      }))).once();
    });
  });
});
