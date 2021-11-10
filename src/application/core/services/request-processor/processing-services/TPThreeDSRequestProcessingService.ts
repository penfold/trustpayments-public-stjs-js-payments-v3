import { IRequestProcessingService } from '../IRequestProcessingService';
import { Service } from 'typedi';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { from, Observable, timer } from 'rxjs';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { FraudControlRequestProcessor } from '../request-processors/FraudControlRequestProcessor';
import { RemainingRequestTypesResponseProcessor } from '../response-processors/RemainingRequestTypesResponseProcessor';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { map, mapTo, switchMap, shareReplay } from 'rxjs/operators';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { threeDSecureConfigName } from '../../three-d-verification/implementations/trust-payments/IThreeDSecure';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { ConfigInterface } from '@trustpayments/3ds-sdk-js';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { ConfigProvider } from '../../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ThreeDLookupRequestProcessor } from '../request-processors/ThreeDLookupRequestProcessor';
import { BrowserDataRequestProcessor } from '../request-processors/BrowserDataRequestProcessor';
import { HideProcessingScreenResponseProcessor } from '../response-processors/HideProcessingScreenResponseProcessor';
import { TPChallengeResponseProcessor } from '../response-processors/TPChallengeResponseProcessor';
import { HideProcessingScreenErrorHandler } from '../error-handlers/HideProcessingScreenErrorHandler';

@Service()
export class TPThreeDSRequestProcessingService implements IRequestProcessingService {
  private processingChain: RequestProcessingChain;
  private jsInitResponse: IThreeDInitResponse;

  constructor(
    private processingChainFactory: RequestProcessingChainFactory,
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
  ) {
  }

  init(jsInitResponse: IThreeDInitResponse): Observable<void> {
    this.jsInitResponse = jsInitResponse;
    this.processingChain = this.processingChainFactory.create(
      [
        FraudControlRequestProcessor,
        ThreeDLookupRequestProcessor,
        BrowserDataRequestProcessor,
      ],
      [
        HideProcessingScreenResponseProcessor,
        TPChallengeResponseProcessor,
        RemainingRequestTypesResponseProcessor,
      ],
      HideProcessingScreenErrorHandler,
    );

    return this.configProvider.getConfig$().pipe(
      map(config => ({
        type: PUBLIC_EVENTS.THREE_D_SECURE_INIT,
        data: config[threeDSecureConfigName],
      })),
      switchMap((queryEvent: IMessageBusEvent<ConfigInterface>) => {
        return from(this.interFrameCommunicator.query<ConfigInterface>(queryEvent, MERCHANT_PARENT_FRAME));
      }),
      mapTo(undefined),
    );
  }

  process(requestData: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse> {
    const options: IRequestProcessingOptions = {
      merchantUrl,
      jsInitResponse: this.jsInitResponse,
      timer: timer(2000).pipe(shareReplay(1)),
    };

    return this.processingChain.process(requestData, options);
  }
}
