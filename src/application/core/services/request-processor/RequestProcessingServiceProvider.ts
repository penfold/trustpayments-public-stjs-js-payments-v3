import { ContainerInstance, Service } from 'typedi';
import { IRequestProcessingService } from './IRequestProcessingService';
import { ThreeDVerificationProviderName } from '../three-d-verification/data/ThreeDVerificationProviderName';
import { CardinalRequestProcessingService } from './processing-services/CardinalRequestProcessingService';
import { TPThreeDSRequestProcessingService } from './processing-services/TPThreeDSRequestProcessingService';
import { NoThreeDSRequestProcessingService } from './processing-services/NoThreeDSRequestProcessingService';
import { RequestType } from '../../../../shared/types/RequestType';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';

@Service()
export class RequestProcessingServiceProvider {
  private static readonly DEFAULT_THREEDS_PROCESSING_SERVICE = CardinalRequestProcessingService;

  constructor(private container: ContainerInstance) {
  }

  getRequestProcessingService(requestTypes: RequestType[], jsInitResponse: IThreeDInitResponse): IRequestProcessingService {
    if (!requestTypes.includes(RequestType.THREEDQUERY)) {
      return this.container.get(NoThreeDSRequestProcessingService);
    }

    switch (jsInitResponse.threedsprovider) {
      case ThreeDVerificationProviderName.CARDINAL:
        return this.container.get(CardinalRequestProcessingService);
      case ThreeDVerificationProviderName.TP:
        return this.container.get(TPThreeDSRequestProcessingService);
      default:
        return this.container.get(RequestProcessingServiceProvider.DEFAULT_THREEDS_PROCESSING_SERVICE);
    }
  }

  getRequestProcessingServiceWithout3D(): IRequestProcessingService {
    return this.container.get(NoThreeDSRequestProcessingService);
  }
}
