import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IRequestProcessingService } from '../IRequestProcessingService';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { IAPMGatewayRequest } from '../../../../../integrations/apm/models/IAPMRequest';
import { TermUrlRequestProcessor } from '../request-processors/TermUrlRequestProcessor';

@Service()
export class APMRequestProcessingService implements IRequestProcessingService {
  private requestProcessingChain: RequestProcessingChain;
  private jsInitResponse: IThreeDInitResponse = null;

  constructor(private requestProcessingChainFactory: RequestProcessingChainFactory) {
  }

  init(jsInitResponse: IThreeDInitResponse | null): Observable<void> {
    this.jsInitResponse = jsInitResponse;
    this.requestProcessingChain = this.requestProcessingChainFactory.create(
      [
        TermUrlRequestProcessor,
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
