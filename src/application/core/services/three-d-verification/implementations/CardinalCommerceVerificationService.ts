import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { from, Observable } from 'rxjs';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { IInitializationData } from '../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { ITriggerData } from '../../../../../client/integrations/cardinal-commerce/data/ITriggerData';
import { PaymentEvents } from '../../../models/constants/PaymentEvents';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { IThreeDVerificationService } from '../IThreeDVerificationService';
import { IVerificationData } from '../data/IVerificationData';
import { IVerificationResult } from '../data/IVerificationResult';

@Service()
export class CardinalCommerceVerificationService implements IThreeDVerificationService<void, void> {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {}

  init(jsInitResponse: IThreeDInitResponse): Observable<void> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_SETUP,
      data: {
        jwt: jsInitResponse.threedinit,
      },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  binLookup(pan: string): Observable<void> {
    const queryEvent: IMessageBusEvent<ITriggerData<string>> = {
      type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
      data: {
        eventName: PaymentEvents.BIN_PROCESS,
        data: pan,
      },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  start(jwt: string): Observable<void> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_START,
      data: { jwt },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  verify(data: IVerificationData): Observable<IVerificationResult> {
    const queryEvent: IMessageBusEvent<IVerificationData> = {
      type: PUBLIC_EVENTS.CARDINAL_CONTINUE,
      data,
    };

    return from(this.interFrameCommunicator.query<IVerificationResult>(queryEvent, MERCHANT_PARENT_FRAME));
  }
}
