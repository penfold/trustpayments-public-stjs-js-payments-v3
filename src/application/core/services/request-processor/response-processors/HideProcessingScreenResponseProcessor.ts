import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';
import { IResponseProcessor } from '../IResponseProcessor';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';

@Service()
export class HideProcessingScreenResponseProcessor implements IResponseProcessor {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {
  }

  process(
    response: IRequestTypeResponse,
    requestData: IStRequest,
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse> {
    const queryEvent: IMessageBusEvent<void> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
    };

    const timer = options.timer || of(0);

    return timer.pipe(
      switchMap(() => this.interFrameCommunicator.query(queryEvent, MERCHANT_PARENT_FRAME)),
      mapTo(response),
    );
  }
}
