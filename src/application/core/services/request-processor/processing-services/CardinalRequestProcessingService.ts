import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IRequestProcessingService } from '../IRequestProcessingService';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { IInitializationData } from '../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { ofType } from '../../../../../shared/services/message-bus/operators/ofType';
import { ITriggerData } from '../../../../../client/integrations/cardinal-commerce/data/ITriggerData';
import { PaymentEvents } from '../../../models/constants/PaymentEvents';
import { RequestProcessingChain } from '../RequestProcessingChain';
import { RequestProcessingChainFactory } from '../RequestProcessingChainFactory';
import { CybertonicaRequestProcessor } from '../request-processors/CybertonicaRequestProcessor';
import { CardinalStartRequestProcessor } from '../request-processors/CardinalStartRequestProcessor';
import { CardinalChallengeResponseProcessor } from '../response-processors/CardinalChallengeResponseProcessor';
import { RemainingRequestTypesResponseProcessor } from '../response-processors/RemainingRequestTypesResponseProcessor';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { CacheTokenRequestProcessor } from '../request-processors/CacheTokenRequestProcessor';

@Service()
export class CardinalRequestProcessingService implements IRequestProcessingService {
  private processingChain: RequestProcessingChain;
  private jsInitResponse: IThreeDInitResponse;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private processingChainFactory: RequestProcessingChainFactory,
  ) {
  }

  init(jsInitResponse: IThreeDInitResponse): Observable<void> {
    this.jsInitResponse = jsInitResponse;
    this.processingChain = this.processingChainFactory.create(
      [
        CacheTokenRequestProcessor,
        CybertonicaRequestProcessor,
        CardinalStartRequestProcessor,
      ],
      [
        CardinalChallengeResponseProcessor,
        RemainingRequestTypesResponseProcessor,
      ],
    );

    return this.setupCardinal(jsInitResponse.threedinit).pipe(
      tap(() => this.initBinLookupListener()),
    );
  }

  process(requestData: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse> {
    const options: IRequestProcessingOptions = {
      merchantUrl,
      jsInitResponse: this.jsInitResponse,
    };

    return this.processingChain.process(requestData, options);
  }

  private setupCardinal(jwt: string): Observable<void> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_SETUP,
      data: {
        jwt,
      },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  private initBinLookupListener(): void {
    this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.BIN_PROCESS),
      map(event => ({
        type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
        data: {
          eventName: PaymentEvents.BIN_PROCESS,
          data: event.data,
        },
      }))
    ).subscribe((triggerEvent: IMessageBusEvent<ITriggerData<unknown>>) => {
      this.interFrameCommunicator.send(triggerEvent, MERCHANT_PARENT_FRAME);
    });
  }
}
