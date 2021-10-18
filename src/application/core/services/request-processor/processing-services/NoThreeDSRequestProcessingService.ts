import { IRequestProcessingService } from '../IRequestProcessingService';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { Observable, of } from 'rxjs';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { Service } from 'typedi';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { CybertonicaRequestProcessor } from '../request-processors/CybertonicaRequestProcessor';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { CacheTokenRequestProcessor } from '../request-processors/CacheTokenRequestProcessor';
import { IAPMGatewayRequest } from '../../../../../integrations/apm/models/IAPMRequest';

@Service()
export class NoThreeDSRequestProcessingService implements IRequestProcessingService {
  private requestProcessingChain: RequestProcessingChain;
  private jsInitResponse: IThreeDInitResponse = null;

  constructor(private requestProcessingChainFactory: RequestProcessingChainFactory) {
  }

  init(jsInitResponse: IThreeDInitResponse | null): Observable<void> {
    this.jsInitResponse = jsInitResponse;
    this.requestProcessingChain = this.requestProcessingChainFactory.create(
      [
        CacheTokenRequestProcessor,
        CybertonicaRequestProcessor,
      ],
      [],
    );

    return of(undefined);
  }

  process(requestData: IStRequest | IAPMGatewayRequest, merchantUrl?: string): Observable<IRequestTypeResponse> {
    const options: IRequestProcessingOptions = {
      merchantUrl,
      jsInitResponse: this.jsInitResponse,
    };

    return this.requestProcessingChain.process(requestData, options);
  }
}
