import { CResToThreeDResponseConverter } from './implementations/CResToThreeDResponseConverter';
import { PaResToThreeDResponseConverter } from './implementations/PaResToThreeDResponseConverter';
import { ThreeDResponseConverter } from './ThreeDResponseConverter';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { ChallengeResultInterface, ResultActionCode } from '@trustpayments/3ds-sdk-js';
import { IThreeDQueryResponse } from '../../../../../models/IThreeDQueryResponse';

describe('ThreeDResponseConverter', () => {
  let cResToThreeDResponseConverterMock: CResToThreeDResponseConverter;
  let paResToThreeDResponseConverterMock: PaResToThreeDResponseConverter;
  let sut: ThreeDResponseConverter;

  const result: ChallengeResultInterface = { status: ResultActionCode.SUCCESS } as ChallengeResultInterface;
  const response: IThreeDQueryResponse = { requesttypescription: 'THREEDQUERY' } as IThreeDQueryResponse;

  beforeEach(() => {
    cResToThreeDResponseConverterMock = mock(CResToThreeDResponseConverter);
    paResToThreeDResponseConverterMock = mock(PaResToThreeDResponseConverter);
    sut = new ThreeDResponseConverter(
      instance(cResToThreeDResponseConverterMock),
      instance(paResToThreeDResponseConverterMock),
    );

    when(cResToThreeDResponseConverterMock.convert(anything(), anything())).thenReturn('threedresponse2');
    when(paResToThreeDResponseConverterMock.convert(anything(), anything())).thenReturn('threedresponse1');
  });

  it('should use cRes converter if threedversion is 2 or higher', () => {
    const responseV2 = { ...response, threedversion: '2.1.0' };

    expect(sut.convert(responseV2, result)).toEqual('threedresponse2');
    verify(cResToThreeDResponseConverterMock.convert(responseV2, result)).once();
  });

  it('should use paRes converter if threedversion is 1', () => {
    const responseV1 = { ...response, threedversion: '1.0.5' };

    expect(sut.convert(responseV1, result)).toEqual('threedresponse1');
    verify(paResToThreeDResponseConverterMock.convert(responseV1, result)).once();
  });
});
