import { IRequestProcessor } from '../IRequestProcessor';
import { Service } from 'typedi';
import { IStRequest } from '../../../models/IStRequest';
import { from, Observable } from 'rxjs';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { mapTo } from 'rxjs/operators';
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
