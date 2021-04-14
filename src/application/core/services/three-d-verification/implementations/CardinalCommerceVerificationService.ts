import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { from, Observable } from 'rxjs';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { IInitializationData } from '../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { ITriggerData } from '../../../../../client/integrations/cardinal-commerce/data/ITriggerData';
import { PaymentEvents } from '../../../models/constants/PaymentEvents';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { IThreeDVerificationService } from '../IThreeDVerificationService';
import { IVerificationData } from '../data/IVerificationData';
import { IVerificationResult } from '../data/IVerificationResult';

@Service()
export class CardinalCommerceVerificationService implements IThreeDVerificationService {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {}

  init(jwt: string): Observable<void> {
    console.log('WHTRBIT init');
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_SETUP,
      data: { jwt },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  binLookup(pan: string): Observable<void> {
    console.log('WHTRBIT binLookup');
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
    console.log('WHTRBIT start');
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_START,
      data: { jwt },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  verify(data: IVerificationData): Observable<IVerificationResult> {
    console.log('WHTRBIT verify');
    const queryEvent: IMessageBusEvent<IVerificationData> = {
      type: PUBLIC_EVENTS.CARDINAL_CONTINUE,
      data,
    };

    return from(this.interFrameCommunicator.query<IVerificationResult>(queryEvent, MERCHANT_PARENT_FRAME));
  }
}
