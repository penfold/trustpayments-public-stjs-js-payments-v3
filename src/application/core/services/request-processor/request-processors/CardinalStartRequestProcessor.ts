import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { IRequestProcessor } from '../IRequestProcessor';
import { IStRequest } from '../../../models/IStRequest';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { IInitializationData } from '../../../../../client/integrations/cardinal-commerce/data/IInitializationData';

@Service()
export class CardinalStartRequestProcessor implements IRequestProcessor {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {}

  process(requestData: IStRequest, options: IRequestProcessingOptions): Observable<IStRequest> {
    const startQueryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_START,
      data: { jwt: options.jsInitResponse.threedinit },
    };

    return from(this.interFrameCommunicator.query<void>(startQueryEvent, MERCHANT_PARENT_FRAME))
      .pipe(mapTo(requestData));
  }
}
