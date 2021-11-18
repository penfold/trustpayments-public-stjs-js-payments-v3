import { ContainerInstance } from 'typedi';
import { instance, mock, when } from 'ts-mockito';
import { ThreeDVerificationProviderName } from '../three-d-verification/data/ThreeDVerificationProviderName';
import { RequestType } from '../../../../shared/types/RequestType';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { RequestProcessingServiceProvider } from './RequestProcessingServiceProvider';
import { NoThreeDSRequestProcessingService } from './processing-services/NoThreeDSRequestProcessingService';
import { CardinalRequestProcessingService } from './processing-services/CardinalRequestProcessingService';
import { TPThreeDSRequestProcessingService } from './processing-services/TPThreeDSRequestProcessingService';

describe('RequestProcessingServiceProvider', () => {
  const noThreeDSRequestProcessingService = instance(mock(NoThreeDSRequestProcessingService));
  const cardinalRequestProcessingService = instance(mock(CardinalRequestProcessingService));
  const tpThreeDSRequestProcessingService = instance(mock(TPThreeDSRequestProcessingService));
  let containerMock: ContainerInstance;
  let requestProcessingServiceProvider: RequestProcessingServiceProvider;

  beforeEach(() => {
    containerMock = mock(ContainerInstance);
    requestProcessingServiceProvider = new RequestProcessingServiceProvider(
      instance(containerMock),
    );

    when(containerMock.get(NoThreeDSRequestProcessingService)).thenReturn(noThreeDSRequestProcessingService);
    when(containerMock.get(CardinalRequestProcessingService)).thenReturn(cardinalRequestProcessingService);
    when(containerMock.get(TPThreeDSRequestProcessingService)).thenReturn(tpThreeDSRequestProcessingService);
  });

  describe('getRequestProcessingService()', () => {
    it('should return NoThreeDSRequestProcessingService when THREEDQUERY is not in request types', () => {
      const jsInitResponse: IThreeDInitResponse = {
        jwt: '',
        threedsprovider: ThreeDVerificationProviderName.CARDINAL,
      };

      const result = requestProcessingServiceProvider.getRequestProcessingService(
        [RequestType.AUTH],
        jsInitResponse,
      );

      expect(result).toBe(noThreeDSRequestProcessingService);
    });

    it.each([
      [ThreeDVerificationProviderName.CARDINAL, cardinalRequestProcessingService],
      [ThreeDVerificationProviderName.TP, tpThreeDSRequestProcessingService],
      [undefined, cardinalRequestProcessingService],
    ])('should return a proper processing service based on the 3DS provider', (providerName, expectedResult) => {
      const jsInitResponse: IThreeDInitResponse = {
        jwt: '',
        threedsprovider: providerName,
      };

      const result = requestProcessingServiceProvider.getRequestProcessingService(
        [RequestType.THREEDQUERY, RequestType.AUTH],
        jsInitResponse,
      );

      expect(result).toBe(expectedResult);
    });
  });

  describe('getRequestProcessingServiceWithout3D()', () => {
    it('should return NoThreeDSRequestProcessingService', () => {
      expect(requestProcessingServiceProvider.getRequestProcessingServiceWithout3D()).toBe(noThreeDSRequestProcessingService);
    });
  });
});
